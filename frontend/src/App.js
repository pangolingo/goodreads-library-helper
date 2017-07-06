import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom'
import './App.css';
import Header from './Header.js'
import BookSummary from './BookSummary.js'
import ShelfPicker from './ShelfPicker.js'
import GoodreadsService from './GoodreadsService.js'
import localForage from 'localforage';

const fakeAuth = {
  isAuthenticated: true,
}

let goodreadsService = new GoodreadsService()


class Home extends Component {
  constructor(props) {
    super(props);
    // console.log(props)
    this.handleShelfNavigate = this.handleShelfNavigate.bind(this);

    // initial state
    this.state = {
      shelvesData: {
        shelves: []
      }
    }
  }
  componentDidMount() {
    goodreadsService.getShelves()
      .then(function(shelvesData){
        console.log(shelvesData)
        this.setState({
          shelvesData
        })
      }.bind(this))
      .catch(function(error){
        if(error.name === "GoodreadsUnauthenticatedException"){
          this.props.history.push('/login')
        } else {
          throw error;
        }
      }.bind(this));
  }
  handleShelfNavigate(newShelfName) {
    // alert(newShelfName);
    this.props.history.push(`/shelves/${newShelfName}`)
  }
  render() {
    return <div>
      <h2>Home</h2>
      <ShelfPicker shelves={this.state.shelvesData.shelves} handleChange={this.handleShelfNavigate}></ShelfPicker>
    </div>
  }
}

class Shelf extends Component {
  constructor(props) {
    super(props);

    // initial state
    this.state = {
      books: [],
      currentpage: 1,
      numpages: null,
      isLoading: false
    }

    this.getNextPage = this.getNextPage.bind(this)
  }
  componentDidMount() {
    this.setState({ isLoading: true })
    goodreadsService.getShelf(this.props.match.params.name, 1)
      .then(function(shelfData){
        console.log(shelfData)
        this.setState({
          books: shelfData.books,
          currentpage: shelfData.pagination.currentpage,
          numpages: shelfData.pagination.numpages,
          isLoading: false
        })
      }.bind(this))
      .catch(function(error){
        this.setState({ isLoading: false })
        if(error.name === "GoodreadsUnauthenticatedException"){
          this.props.history.push('/login')
        } else {
          throw error;
        }
      }.bind(this));
  }
  getNextPage() {
    this.setState({ isLoading: true })
    if(this.state.currentpage >= this.state.numpages){
      return;
    }
    goodreadsService.getShelf(this.props.match.params.name, this.state.currentpage + 1)
      .then(function(shelfData){
        console.log(shelfData)
        this.setState({
          books: this.state.books.concat(shelfData.books),
          currentpage: shelfData.pagination.currentpage,
          numpages: shelfData.pagination.numpages,
          isLoading: false
        })
      }.bind(this))
      .catch(function(error){
        this.setState({ isLoading: false })
        if(error.name === "GoodreadsUnauthenticatedException"){
          this.props.history.push('/login')
        } else {
          throw error;
        }
      }.bind(this));
  }
  render() {
    let bookSummaries = []
    bookSummaries = this.state.books.map((book) => {
      return <BookSummary key={book.id} book={book}></BookSummary>
    });

    let pagination = <span></span>
    if(this.state.numpages > 1){
      pagination = <span>page {this.state.currentpage} of {this.state.numpages}</span>
    }
    let nextPageButton = '';
    if(this.state.currentpage < this.state.numpages){
      nextPageButton =  <button onClick={this.getNextPage}>Load next page</button>
    }

    return <div>
      <Link to="/">Back</Link>
      <h2>Shelf {this.props.match.params.name}</h2>
      {bookSummaries}
      {this.state.isLoading ? 'LOADING...' : ''}
      {pagination}
      {nextPageButton}
    </div>
  }
}


const Login = () => (
  <div>
    <h2>Log In</h2>
    <a href="/api/oauth">Log in with Goodreads</a>
  </div>
)

const NoMatch = () => (
  <div>
    <h2>404</h2>
    <Link to="/">Home</Link>
  </div>
)

// taken from react router docs
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    fakeAuth.isAuthenticated ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)


class App extends Component {
  clearCache(){
    localForage.clear();
  }
  render() {
    return (
      <div className="App">
        <button onClick={this.clearCache}>Clear Cache</button>
         <Router>
          <div>
            <Header />
            <hr />
            <div>
              <Switch>
                <PrivateRoute exact path="/" component={Home}/>
                <PrivateRoute path="/shelves/:name" component={Shelf}/>
                <PrivateRoute path="/shelves" component={Home}/>
                <Route path="/login" component={Login}/>
                <Route component={NoMatch}/>
              </Switch>
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
