# Reading List Library Helper

An app to list your Goodreads shelves and books, and cache them locally
so you can browse them offline.

This allows you to walk into the public library and quickly look through
the books on your Goodreads to-read list, in order to find the ones you
want to check out.

## Todo

### major
- works offline
- make it look nice
- add ability to clear cached data and/or versioning of cached data
  - also refactor caching to avoid caching by shelf page
  - and allow caching for multiple user accounts
- tests
- enforce Goodread's API terms of use:
  - no more than 1 request per endpoint per second
  - display Goodreads name/logo
  - link back to the Goodreads page where the data appears
- favoriting books so they appear at the top of the list

### minor

- in production force a redirect to HTTPs
- enable cache-control in production
- enable gzip compression
- login page should redirect to home if already logged in
