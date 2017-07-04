import React, { Component } from 'react';

class BookSummary extends Component {
    render(){
      let book = this.props.book;
      let authors = book.authors.reduce((sum, author) => {
        return `${sum}, ${author.name}`;
      }, '')
        .slice(2);
      let catalogTitleUrl = `https://ropl.ent.sirsi.net/client/default/search/results?dt=list&t%3Aformdata=&qu=${encodeURIComponent(book.title_without_series)}&rt=false%7C%7C%7CTITLE%7C%7C%7CTitle`;
      let catalogAuthorUrl = `https://ropl.ent.sirsi.net/client/default/search/results?dt=list&t%3Aformdata=&qu=${encodeURIComponent(authors)}&rt=false%7C%7C%7CAUTHOR%7C%7C%7CAuthor`;
      return <div>
        <img src={book.small_image_url} />
        <h2>{book.title}</h2>
        <span>{authors}</span>
        <br />
        <a href={catalogTitleUrl} target="_blank" rel="noopener noreferrer">Find title in Rochester Library</a>
        <br />
        <a href={catalogAuthorUrl} target="_blank" rel="noopener noreferrer">Find author in Rochester Library</a>
      </div>
    }
}

export default BookSummary;