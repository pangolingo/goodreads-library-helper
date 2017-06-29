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
  getShelvesRaw(){
    return this.request('/shelves')
      .then(function(response){
        if(!response.ok){
          if(response.status === 401){
            throw new GoodreadsUnauthenticatedException();
          } else {
            throw new GoodreadsException(response.status, response.statusText);
          }
        }
        return response.text();
      })
  }
  getShelves(){
    return this.getShelvesRaw()
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
            book_count: shelfElement.getElementsByTagName('book_count')[0].textContent,
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
        return shelves;
      })
  }
}

export default GoodreadsService;