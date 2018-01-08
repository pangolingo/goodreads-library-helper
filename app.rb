require 'oauth'
require 'dotenv/load'
require 'sinatra'
require "sinatra/reloader" if ENV['RACK_ENV'] == 'development'
require 'jwt'
require 'uri'
require './guidestar'

$consumer = OAuth::Consumer.new(
  ENV['GOODREADS_API_KEY'],
  ENV['GOODREADS_API_SECRET'],
  :site => "https://www.goodreads.com"
)

# sinatra settings
set :server, :puma
set :root, File.dirname(__FILE__)
set :sessions, true
set :static, true


def authenticate!
  catch(:unauthorized) do
    # get the jwt from the request
    # header looks like
    #     Authorization: Bearer jwt_goes_here
    auth_header = request.env["HTTP_AUTHORIZATION"]
    throw :unauthorized unless auth_header
    jwt = auth_header.gsub('Bearer ', '')

    # decode the JWT
    decoded_jwt = JWT.decode jwt, ENV['HMAC_SECRET'], true, { :algorithm => 'HS256' }
    client_access_token = decoded_jwt[0]['gr_acc_tok']
    client_access_token_secret = decoded_jwt[0]['gr_acc_tok_secr']

    throw :unauthorized unless client_access_token && client_access_token_secret

    # build access token from JWT access token info
    hash = {
      oauth_token: client_access_token,
      oauth_token_secret: client_access_token_secret
    }
    return OAuth::AccessToken.from_hash($consumer, hash)
  end
  # fail if we couldn't get the token info
  halt 401, {}, 'User not authenticated'
end

def default_headers
  headers = {
    "Access-Control-Allow-Origin" => "*",
  }
end



# ==============
# ENDPOINTS
# ==============

# require authentication on all API urls
before '/api*' do
  pass if request.request_method == 'OPTIONS'

  puts 'Authenticating'
  @access_token = authenticate!
end

# respond to CORS requests
options '*' do
  # res.header("Access-Control-Allow-Origin", "*");
  # res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  headers = {
    "Access-Control-Allow-Origin" => "*",
    "Access-Control-Allow-Headers" => "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Methods" => "POST, GET, OPTIONS, DELETE"
  }
  [ 200, headers, '' ]
end

get '/' do
  'Reading List Library Helper - Backend API'
end

get '/oauth/?' do
  client_callback_url = params[:callback_url]
  server_callback_url = "#{request.base_url}/oauth/callback"

  halt 400, {}, 'No callback url specified' unless client_callback_url

  # build a request token object
  request_token = $consumer.get_request_token(:oauth_callback => server_callback_url)

  # stash the token variables and redirect url to be used again in the callback
  session[:request_token] = request_token.token
  session[:request_token_secret] = request_token.secret
  session[:client_callback_url] = client_callback_url

  # redirect to goodreads
  redirect request_token.authorize_url(:oauth_callback => server_callback_url)
end

get '/oauth/callback/?' do
  # build a request token object
  hash = {
    oauth_token: session[:request_token],
    oauth_token_secret: session[:request_token_secret]
  }
  request_token  = OAuth::RequestToken.from_hash($consumer, hash)

  # get an access token from the request token
  access_token = request_token.get_access_token
  puts "i have an access token! #{access_token.token}"

  # remove the request token and callback from the session
  session.delete(:request_token)
  session.delete(:request_token_secret)
  client_callback_url = session.delete(:client_callback_url)

  # create a JWT with the access token for the client
  payload = {
    gr_acc_tok: access_token.token,
    gr_acc_tok_secr: access_token.secret
  }
  jwt = JWT.encode payload, ENV['HMAC_SECRET'], 'HS256'

  # add jwt to callback url
  callback_uri =  URI.parse(client_callback_url)
  new_query_arr = URI.decode_www_form(String(callback_uri.query)) << ["jwt", jwt]
  callback_uri.query = URI.encode_www_form(new_query_arr)

  # redirect back to the API client
  redirect callback_uri
end

get '/api/?' do
  g = Guidestar.new(@access_token)
  [ 200, default_headers, g.current_user() ]
end

get '/api/shelves/?' do
  g = Guidestar.new(@access_token)
  [ 200, default_headers, g.shelves() ]
end

get '/api/shelves/:name/?' do
  g = Guidestar.new(@access_token)
  [200, default_headers, g.shelf(params['name'], params['page'] || 1, params['per_page'] || 200) ]
end


