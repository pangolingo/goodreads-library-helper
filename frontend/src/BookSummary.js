import React, { Component } from 'react';

class BookSummary extends Component {
    render(){
      let authors = this.props.book.authors.reduce((sum, author) => {
        return `${sum}, ${author.name}`;
      }, '')
        .slice(2);
      return <div>
        <h2>{this.props.book.title}</h2>
        <span>{authors}</span>
      </div>
    }
}

export default BookSummary;