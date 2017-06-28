import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import Header from './Header.js'
import BookSummary from './BookSummary.js'
import ShelfPicker from './ShelfPicker.js'

const fakeAuth = {
  isAuthenticated: true,
}


class Home extends Component {
  constructor(props) {
    super(props);
    // console.log(props)
    this.handleShelfChange = this.handleShelfChange.bind(this);
  }
  handleShelfChange(newShelfName) {
    // alert(newShelfName);
    this.props.history.push(`/shelves/${newShelfName}`)
  }
  render() {
    return <div>
      <h2>Home</h2>
      <ShelfPicker shelves="" handleChange={this.handleShelfChange}></ShelfPicker>
    </div>
  }
}

class Shelf extends Component {
  constructor(props) {
    super(props);
    // console.log(props)
  }
  render() {
    return <div>
      <h2>Shelf {this.props.match.params.name}</h2>
      <BookSummary title="To Kill a Mockingbird"></BookSummary>
      <BookSummary title="Call of the Wild"></BookSummary>
      <Link to="/">Back</Link>
    </div>
  }
}


const Login = () => (
  <div>
    <h2>Log In</h2>
    <a href="/oauth_url_here">Log in with Goodreads</a>
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
  render() {
    return (
      <div className="App">
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
