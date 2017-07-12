require 'oauth'
require 'dotenv/load'
require 'mustermann'
require 'sinatra'
require "sinatra/reloader" if ENV['RACK_ENV'] == 'development'

if ENV['RACK_ENV'] == 'production'
  app_home_url = "/"
  callback_url = "http://reading-list-library-helper.herokuapp.com/api/oauth/callback"
elsif ENV['RACK_ENV'] == 'staging'
  app_home_url = "/"
  callback_url = "http://localhost:4567/api/oauth/callback"
else
  app_home_url = "http://localhost:3000/"
  callback_url = "http://localhost:4567/api/oauth/callback"
end

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
set :public_folder, Proc.new { File.join(settings.root, 'frontend', 'build') }

auth_urls = Mustermann.new('/api/*', except: '/api/oauth*')
before auth_urls do
  puts 'Authenticating'
  authenticate!
end

def authenticate!
  return if session[:access_token]
  # redirect '/oauth'
  # return [401, {}, 'Nser not authenticated'] and exit
  halt 401, {}, 'User not authenticated'
end

get '/' do
  File.read(File.join(settings.root, 'frontend', 'build', 'index.html'))
end

get '/api/oauth' do

  request_token = consumer.get_request_token(:oauth_callback => callback_url)

  session[:request_token] = request_token.token
  session[:request_token_secret] = request_token.secret
  redirect request_token.authorize_url(:oauth_callback => callback_url)

end

get '/api/oauth/callback' do
  hash = {
    oauth_token: session[:request_token],
    oauth_token_secret: session[:request_token_secret]
  }
  request_token  = OAuth::RequestToken.from_hash(consumer, hash)

  # puts request_token
  # puts consumer.access_token_url
  access_token = request_token.get_access_token
  session[:access_token] = access_token.token
  session[:access_token_secret] = access_token.secret
  # # @photos = @access_token.get('/photos.xml')

  puts "i have an access token! #{access_token.token}"


  # puts user.body
  redirect app_home_url

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

# catchall
get '/*' do
  File.read(File.join(settings.root, 'frontend', 'build', 'index.html'))
end

def access_token(consumer)
  hash = {
    oauth_token: session[:access_token],
    oauth_token_secret: session[:access_token_secret]
  }
  access_token  = OAuth::AccessToken.from_hash(consumer, hash)
end

class Guidestar

  def initialize(access_token)
    @access_token = access_token
  end

  def current_user
    @access_token.get('/api/auth_user').body
  end

  def shelves
    @access_token.get('/shelf/list').body
  end

  def shelf(name, page, per_page)
    raise "per_page must be less than or equal to 200" if per_page.to_i > 200

    url = '/review/list.xml'
    query_string = Rack::Utils.build_query({
      per_page: per_page,
      page: page,
      shelf: name,
    })

    # all guidestar options
    #   # v: 2.to_s,
    #   # # id: user_id.to_s,
    #   # shelf: name,
    #   # sort: 'title',
    #   # per_page: 200.to_s,
    #   # key: ENV['goodreads_api_key']
    @access_token.get("#{url}?#{query_string}").body
  end
end


