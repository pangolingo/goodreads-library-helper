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