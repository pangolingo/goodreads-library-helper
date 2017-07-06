import GoodreadsService, {GoodreadsException, GoodreadsUnauthenticatedException} from './GoodreadsService';
import fs from 'fs'

beforeEach(() => {
  window.goodreadsService = new GoodreadsService()
});


describe('checkResponseCode', () => {

  it('returns true for a success code', () => {
    let response = new Response('', { "status" : 200 , "statusText" : "OK!" });
    let result = window.goodreadsService.checkResponseCode(response)
    expect(result).toBe(true)
  });

  it('it throws an error if the response code isn\'t ok', () => {
    let response = new Response('', { "status" : 404 });
    expect(() => {
      window.goodreadsService.checkResponseCode(response)
    }).toThrow(GoodreadsException);
  });

  it('it throws a "not authenticated" error if the response code is 401', () => {
    let response = new Response('', { "status" : 401 });
    expect(() => {
      window.goodreadsService.checkResponseCode(response)
    }).toThrow(GoodreadsUnauthenticatedException);
  });

})

describe('parseShelf', () => {
  it('returns an array of books', () => {
    let shelfXML = fs.readFileSync(__dirname+'/test/fixtures/shelf.xml', 'utf8')
    let result = window.goodreadsService.parseShelf('test', shelfXML)
    expect(result.books.length).toBe(79)


  });

  it('returns books with the right keys', () => {
    let shelfXML = fs.readFileSync(__dirname+'/test/fixtures/shelf.xml', 'utf8')
    let result = window.goodreadsService.parseShelf('test', shelfXML);
    let firstBook = result.books[0];
    expect(firstBook.id).toBe(14201)
    expect(firstBook.isbn).toBe("0765356155")
    expect(firstBook.isbn13).toBe("9780765356154")
    expect(firstBook.title).toBe("Jonathan Strange & Mr Norrell")
    expect(firstBook.title_without_series).toBe("Jonathan Strange & Mr Norrell")
    expect(firstBook.image_url).toBe("http://images.gr-assets.com/books/1357027589m/14201.jpg")
    expect(firstBook.small_image_url).toBe("http://images.gr-assets.com/books/1357027589s/14201.jpg")
    expect(firstBook.link).toBe("http://www.goodreads.com/book/show/14201.Jonathan_Strange_Mr_Norrell")
    expect(firstBook.published).toBe("2006")
    expect(firstBook.description).toBe("At the dawn of the nineteenth century, two very different magicians emerge to change England's history. In the year 1806, with the Napoleonic Wars raging on land and sea, most people believe magic to be long dead in England--until the reclusive Mr Norrell reveals his powers, and becomes a celebrity overnight.<br /><br />Soon, another practicing magician comes forth: the young, handsome, and daring Jonathan Strange. He becomes Norrell's student, and they join forces in the war against France. But Strange is increasingly drawn to the wildest, most perilous forms of magic, straining his partnership with Norrell, and putting at risk everything else he holds dear.")
    expect(firstBook.authors.length).toBe(1)
  });

  it('gets pagination details', () => {
    let shelfXML = fs.readFileSync(__dirname+'/test/fixtures/shelf.xml', 'utf8')
    let result = window.goodreadsService.parseShelf('test', shelfXML);

    expect(result.pagination.start).toBe(1)
    expect(result.pagination.end).toBe(187)
    expect(result.pagination.total).toBe(187)
    expect(result.pagination.numpages).toBe(1)
    expect(result.pagination.currentpage).toBe(1)
  })
})

describe('cacheShelf', () => {
  // how do we test this without the browser?
  it.skip('saves data in indexdb')
});










