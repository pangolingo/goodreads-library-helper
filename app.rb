require 'oauth'
require 'sinatra'
require 'dotenv/load'

callback_url = "http://localhost:4567/oauth/callback"
consumer = OAuth::Consumer.new(ENV['goodreads_api_key'],ENV['goodreads_api_secret'], :site => "http://www.goodreads.com")

set :sessions, true

get '/oauth' do

  request_token = consumer.get_request_token(:oauth_callback => callback_url)

  puts request_token.token
  puts request_token.secret

  session[:token] = request_token.token
  session[:token_secret] = request_token.secret
  redirect request_token.authorize_url(:oauth_callback => callback_url)

end

get '/oauth/callback' do
  hash = { oauth_token: session[:token], oauth_token_secret: session[:token_secret]}
  request_token  = OAuth::RequestToken.from_hash(consumer, hash)

  puts "orig request token: #{session[:token]}"
  puts "new token on   url: #{params[:oauth_token]}"

  # puts request_token
  # puts consumer.access_token_url
  access_token = request_token.get_access_token
  # # @photos = @access_token.get('/photos.xml')

  # puts "i have an access token! #{access_token.token}"
  user = access_token.get('/api/auth_user')

  puts user.body

end
