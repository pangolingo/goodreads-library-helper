require 'oauth'
require 'dotenv/load'
require 'sinatra'
require "sinatra/reloader" if ENV['RACK_ENV'] == 'development'
require './guidestar'

consumer = OAuth::Consumer.new(
  ENV['goodreads_api_key'],
  ENV['goodreads_api_secret'],
  :site => "http://www.goodreads.com"
)

# sinatra settings
set :server, :puma
set :root, File.dirname(__FILE__)
set :sessions, true
set :static, true


def authenticate!
  return if session[:access_token]
  # redirect '/oauth'
  # return [401, {}, 'Nser not authenticated'] and exit
  halt 401, {}, 'User not authenticated'
end

def access_token(consumer)
  hash = {
    oauth_token: session[:access_token],
    oauth_token_secret: session[:access_token_secret]
  }
  access_token  = OAuth::AccessToken.from_hash(consumer, hash)
end





# ==============
# ENDPOINTS
# ==============

# require authentication on all API urls
before '/api/*' do
  puts 'Authenticating'
  authenticate!
end

get '/' do
  'Reading List Library Helper - Backend API'
end

get '/oauth' do
  client_callback_url = params[:callback_url]
  server_callback_url = "#{request.base_url}/oauth/callback"

  halt 400, {}, 'No callback url specified' unless client_callback_url

  # build a request token object
  request_token = consumer.get_request_token(:oauth_callback => server_callback_url)

  # stash the token variables and redirect url to be used again in the callback
  session[:request_token] = request_token.token
  session[:request_token_secret] = request_token.secret
  session[:client_callback_url] = client_callback_url

  # redirect to goodreads
  redirect request_token.authorize_url(:oauth_callback => server_callback_url)
end

get '/oauth/callback' do
  # build a request token object
  hash = {
    oauth_token: session[:request_token],
    oauth_token_secret: session[:request_token_secret]
  }
  request_token  = OAuth::RequestToken.from_hash(consumer, hash)

  # get an access token from the request token
  access_token = request_token.get_access_token
  puts "i have an access token! #{access_token.token}"

  # save the access token in the session for the user
  session[:access_token] = access_token.token
  session[:access_token_secret] = access_token.secret

  # remove the request token and callback from the session
  session.delete(:request_token)
  session.delete(:request_token_secret)
  client_callback_url = session.delete(:client_callback_url)

  # redirect back to the API client
  redirect client_callback_url
end

get '/api' do
  g = Guidestar.new(access_token(consumer))
  g.current_user()
end

get '/api/shelves' do
  g = Guidestar.new(access_token(consumer))
  g.shelves()
end

get '/api/shelves/:name' do
  g = Guidestar.new(access_token(consumer))
  g.shelf(params['name'], params['page'] || 1, params['per_page'] || 200)
end


