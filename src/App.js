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
      web3: null
    }
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
    var sciFiInstance;

    var setMovieDetails = function (instance, _this, index) {
      var movieName;
      instance.movies.call(index).then((res) => {
        movieName = _this.state.web3.toAscii(res).trim().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
        instance.bids.call(res).then((res) => {
          _this.setState({ movies: [..._this.state.movies, movieName + ' [' + res + ']'] });
        });
      });
    }

    this.state.web3.eth.getAccounts((error, accounts) => {
      sciFi.deployed().then((instance) => {
        sciFiInstance = instance;
        console.log(instance);

        var name = this.state.web3.fromAscii('Terminator 2');        
        sciFiInstance.vote(name, { value: 200, from: accounts[0] }).then((result) => {
          // Get the movies from the contract
          sciFiInstance.movie_num.call().then((res) => {
            var movieNum = res.c[0];

            this.setState({ movieNum: movieNum });
            this.setState({ movies: [] });

            // Get list of movies with bids
            for (var i = 0; i < movieNum; i++) {
              setMovieDetails(sciFiInstance, this, i);
            }

          });

        });

      });
    });

  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>The movies are:</p>
              <ul>
                {this.state.movies.map(function (name, index) {
                  return <li key={index}>{name}</li>;
                })}
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
