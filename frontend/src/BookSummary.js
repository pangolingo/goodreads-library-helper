import React, { Component } from 'react';

class BookSummary extends Component {
    render(){
      let authors = this.props.book.authors.reduce((sum, author) => {
        return `${sum}, ${author.name}`;
      }, '')
        .slice(2);
      // let encodedTitle = encodeURIComponent(this.props.book.title);
      // let catalogUrl = `http://catalog.rochesterpubliclibrary.org/weblib/libcat?action=text-search&Ntt=${encodedTitle}&Ntk=Titles`;
      let catalogTitleUrl = `https:\/\/ropl.ent.sirsi.net/client/default/search/results?dt=list&t%3Aformdata=&qu=${encodeURIComponent(this.props.book.title)}&rt=false%7C%7C%7CTITLE%7C%7C%7CTitle`;
      let catalogAuthorUrl = `https:\/\/ropl.ent.sirsi.net/client/default/search/results?dt=list&t%3Aformdata=&qu=${encodeURIComponent(authors)}&rt=false%7C%7C%7CAUTHOR%7C%7C%7CAuthor`;
      return <div>
        <h2>{this.props.book.title}</h2>
        <span>{authors}</span>
        <br />
        <a href={catalogTitleUrl} target="_blank">Find title in Rochester Library</a>
        <br />
        <a href={catalogAuthorUrl} target="_blank">Find author in Rochester Library</a>
      </div>
    }
}

export default BookSummary;