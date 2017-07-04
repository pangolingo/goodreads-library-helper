import localForage from 'localforage';
import moment from 'moment';

export function GoodreadsException(code, message) {
   this.message = message;
   this.code = code;
   this.name = 'GoodreadsException';
}

export function GoodreadsUnauthenticatedException() {
   this.message = 'Unauthenticated';
   this.code = 401;
   this.name = 'GoodreadsUnauthenticatedException';
}

class GoodreadsService {
  authenticate(){

  }
  request(endpoint, settings = {}){
    settings = Object.assign({}, settings, {
      credentials: 'include'
    });
    return fetch(endpoint, settings)
    // .then(function(response) {
    //   return response.blob();
    // }).then(function(myBlob) {
    //   var objectURL = URL.createObjectURL(myBlob);
    //   myImage.src = objectURL;
    // });
  }
  loadShelf(name){
    return this.loadShelfRaw(name)
      .then(function(xmlStr){
        console.log(xmlStr);
        let domParser = new window.DOMParser();
        let doc =  domParser.parseFromString(xmlStr, "text/xml");
        let booksElements = doc.getElementsByTagName('book');
        let books = [];
        for (var bookElement of booksElements) {
          var authorElements = bookElement.getElementsByTagName('author');
          var authors = [];
          for(var authorElement of authorElements){
            authors.push({
              id: authorElement.getElementsByTagName('id')[0].textContent,
              name: authorElement.getElementsByTagName('name')[0].textContent,
              // role: authorElement.getElementsByTagName('role')[0].textContent,
              // image_url: authorElement.getElementsByTagName('image_url')[0].textContent,
              // small_image_url: authorElement.getElementsByTagName('small_image_url')[0].textContent,
              // link: authorElement.getElementsByTagName('link')[0].textContent,
              // average_rating: authorElement.getElementsByTagName('average_rating')[0].textContent,
              // ratings_count: authorElement.getElementsByTagName('ratings_count')[0].textContent,
            })
          }

          books.push({
            id: bookElement.getElementsByTagName('id')[0].textContent,
            isbn: bookElement.getElementsByTagName('isbn')[0].textContent,
            isbn13: Number(bookElement.getElementsByTagName('isbn13')[0].textContent),
            title: bookElement.getElementsByTagName('title')[0].textContent,
            title_without_series: bookElement.getElementsByTagName('title_without_series')[0].textContent,
            image_url: bookElement.getElementsByTagName('image_url')[0].textContent,
            small_image_url: bookElement.getElementsByTagName('small_image_url')[0].textContent,
            // large_image_url: bookElement.getElementsByTagName('large_image_url')[0].textContent,
            link: bookElement.getElementsByTagName('link')[0].textContent,
            // num_pages: bookElement.getElementsByTagName('num_pages')[0].textContent,
            // format: bookElement.getElementsByTagName('format')[0].textContent,
            // edition_information: bookElement.getElementsByTagName('edition_information')[0].textContent,
            // publisher: bookElement.getElementsByTagName('publisher')[0].textContent,
            // publication_day: bookElement.getElementsByTagName('publication_day')[0].textContent,
            // publication_year: bookElement.getElementsByTagName('publication_year')[0].textContent,
            // publication_month: bookElement.getElementsByTagName('publication_month')[0].textContent,
            published: bookElement.getElementsByTagName('published')[0].textContent,
            // average_rating: bookElement.getElementsByTagName('average_rating')[0].textContent,
            // ratings_count: bookElement.getElementsByTagName('ratings_count')[0].textContent,
            description: bookElement.getElementsByTagName('description')[0].textContent,
            authors
          })
        }

        let bookData = {
          queryDate: Date.now(),
          books
        };

        localForage.setItem(`shelf.${name}`, bookData)

        return bookData
      })
  }
  getShelf(name){
    return localForage.getItem(`shelf.${name}`)
      .then((bookData) => {
        if(bookData === null || this.responseIsExpired(bookData.queryDate)){
          return this.loadShelf(name);
        } else {
          return bookData
        }
      });
  }
  loadShelfRaw(name){
    return this.request(`/api/shelves/${name}`)
      .then((response) => {
        this.checkResponseCode(response);
        return response.text();
      })
  }
  getShelves(){
    return localForage.getItem('shelves')
      .then((shelvesData) => {
        if(shelvesData === null || this.responseIsExpired(shelvesData.queryDate)){
          return this.loadShelves();
        } else {
          return shelvesData
        }
      });
  }
  loadShelvesRaw(){
    return this.request('/api/shelves')
      .then((response) => {
        this.checkResponseCode(response);
        return response.text();
      })
  }
  loadShelves(){
    return this.loadShelvesRaw()
      .then(function(xmlStr){
        console.log(xmlStr);
        let domParser = new window.DOMParser();
        let doc =  domParser.parseFromString(xmlStr, "text/xml");
        let shelvesElements = doc.getElementsByTagName('user_shelf');
        let shelves = [];
        for (var shelfElement of shelvesElements) {
          shelves.push({
            id: shelfElement.getElementsByTagName('id')[0].textContent,
            name: shelfElement.getElementsByTagName('name')[0].textContent,
            book_count: Number(shelfElement.getElementsByTagName('book_count')[0].textContent),
            description: shelfElement.getElementsByTagName('description')[0].textContent
            // sort:
            // order:
            // per_page:
            // display_fields:
            // featured:
            // recommend_for:
            // sticky:
          })
        }

        let shelvesData = {
          queryDate: Date.now(),
          shelves
        };

        localForage.setItem('shelves', shelvesData)

        return  shelvesData;
      })
  }
  checkResponseCode(response){
    if(!response.ok){
      if(response.status === 401){
        throw new GoodreadsUnauthenticatedException();
      } else {
        throw new GoodreadsException(response.status, response.statusText);
      }
    }
    return true;
  }
  responseIsExpired(responseQueryDate){
    // the query date was more than 1 day ago
    return moment(responseQueryDate).add(1, 'day') < moment()
  }
}

export default GoodreadsService;