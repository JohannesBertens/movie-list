import React, { Component } from 'react'
import SciFiContract from '../build/contracts/SciFi.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movieNum: 0,
      movies: [],
      toVote: '',
      web3: null,
      sciFiInstance: null,
      account: null,
      image: "images/fulls/Term.jpg",
      selectedMovie: "Movie"
    }
  }

  componentDidMount() {
    //mainInit.init();
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  updateValue(modifiedValue) {
    this.setState({
      toVote: modifiedValue.target.value
    })
  }

  voteFromButton = () => {
    this.voteForMovie(this.state.toVote, () => this.updateState());
  }

  voteForMovie = (movie, callback) => {
    var name = this.state.web3.fromAscii(movie);
    this.state.sciFiInstance.vote(name, { value: 200, from: this.state.account }).then(callback);
  }

  updateState = () => {
    this.state.sciFiInstance.movie_num.call().then((res) => {
      this.setState({ movieNum: res.c[0] });
      this.setState({ movies: [] });

      // Get list of movies with bids
      for (var i = 0; i < this.state.movieNum; i++) {
        this.setMovieDetails(i);
      }
    });
  }


  setMovieDetails = (index) => {
    var movieName;
    this.state.sciFiInstance.movies.call(index).then((res) => {
      movieName = this.state.web3.toAscii(res).trim().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
      this.state.sciFiInstance.bids.call(res).then((res) => {
        this.setState({ movies: [...this.state.movies, movieName + ' [' + res + ']'] });
      });
    });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const sciFi = contract(SciFiContract);
    sciFi.setProvider(this.state.web3.currentProvider);

    this.state.web3.eth.getAccounts((error, accounts) => {
      sciFi.deployed().then((instance) => {
        this.setState({ sciFiInstance: instance });
        this.setState({ account: accounts[0] });

        this.voteForMovie('Terminator 2', () => {
          // Get the movies from the contract

          this.updateState();
        });

      });
    });

  }

  switchTo = (e) => {
    this.setState({ selectedMovie: e.target.alt });
    this.setState({ image: e.target.parentElement.href});
    e.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <div id="main">

          <header id="header">
            <h1>Smart Movie Voting</h1>
            <p>Pay to win!</p>
            <p>The current list is:</p>

          </header>

          <section id="thumbnails">
            {this.state.movies.map((name, index) => {
              return <article key={index}>
                <a onClick={this.switchTo.bind(this)} className="thumbnail" href={"images/fulls/" + name.substring(0, 4).toLowerCase() + ".jpg"}>
                  <img src={"images/thumbs/" + name.substring(0, 4).toLowerCase() + ".jpg"} alt={name} />
                </a>
                <h2>{name}</h2>
              </article>;
            })}
          </section>

          <footer id="footer">
            <input placeholder="New Movie" className="input" value={this.state.toVote} onChange={this.updateValue.bind(this)}></input>
            <button className="xsmall button" onClick={this.voteFromButton.bind(this)}>Vote</button>
          </footer>

        </div>


        <div id="viewer">
          <div className="inner" style={{ backgroundImage: `url(${this.state.image})`, backgroundSize: "cover" }}>
            <h2>{this.state.selectedMovie}</h2>
          </div>
        </div>

      </div>
    );
  }
}

export default App
