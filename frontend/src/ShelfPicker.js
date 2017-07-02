import React, { Component } from 'react';

class ShelfPicker extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    // alert(event.target.value);
    // debugger;
    this.props.handleChange(event.target.value)
  }
  render() {
    const shelfOptions = this.props.shelves.map((shelf) => {
      let bookCountText = '';
      if(shelf.book_count > 0){
        bookCountText = `(${shelf.book_count} books)`
      }
      return <option key={shelf.id} value={shelf.name}>{shelf.name} {bookCountText}</option>
    });
    return <div>
      <select name="shelf" onChange={this.handleChange}>
        <option value=""></option>
        {shelfOptions}
      </select>
    </div>
  }
}

export default ShelfPicker;