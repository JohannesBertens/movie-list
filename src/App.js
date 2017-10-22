import React, { Component } from 'react'
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
      image: "images/fulls/terminator.jpg",
      selectedMovie: "Terminator"
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    getWeb3.then(results => {
      this.setState({ web3: results.web3 });

      // Instantiate contract once web3 provided.
      this.instantiateContract();
    }).catch((e) => {
      console.log('Error finding web3.')
      console.log(e);
    })
  }

  updateValue(modifiedValue) {
    this.setState({
      toVote: modifiedValue.target.value
    })
  }

  voteFromButton = () => {
    this.voteForMovie(this.state.toVote, (err) => {
      if (err) {
        console.log(err);
      } else {
        this.updateState();
      }
    });
  }

  voteForMovie = (movie, callback) => {
    var name = this.state.web3.fromAscii(movie);
    this.state.sciFiInstance.vote(name, { value: 200, from: this.state.account }, callback);
  }

  updateState = () => {
    this.state.sciFiInstance.movie_num.call((err, res) => {
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
    this.state.sciFiInstance.movies.call(index, (err, name) => {
      movieName = this.state.web3.toAscii(name).trim().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
      this.state.sciFiInstance.bids.call(name, (err2, bid) => {
        this.setState({ movies: [...this.state.movies, [movieName, bid]] });
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

    this.state.web3.eth.getAccounts((error, accounts) => {
      const sciFi = this.state.web3.eth.contract([{ "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "movies", "outputs": [{ "name": "", "type": "bytes32" }], "type": "function" }, { "constant": true, "inputs": [], "name": "movie_num", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "bytes32" }], "name": "bids", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "name", "type": "bytes32" }], "name": "vote", "outputs": [], "type": "function" }]).at('0xd94badbec21695b7a36abcb979efad0108319d18');
      this.setState({ sciFiInstance: sciFi });
      this.setState({ account: accounts[0] });
      this.updateState();
    });

  }

  switchTo = (e) => {
    this.setState({ selectedMovie: e.target.alt });
    this.setState({ image: e.target.parentElement.href });
    e.preventDefault();
  }

  toFileName(name) {
    return name.toLowerCase().replace(':','_');
  }

  render() {
    return (
      <div className="App">
        <div id="main">

          <header id="header">
            <h2>Smart Movie Voting</h2>
          </header>

          <section id="thumbnails">
            {this.state.movies.sort((a, b) => {return b[1] - a[1]}).map(([name, bid], index) => {
              return <article key={index}>
                <a onClick={this.switchTo.bind(this)} className="thumbnail" href={"images/fulls/" + this.toFileName(name) + ".jpg"}>
                  <img src={"images/thumbs/" + this.toFileName(name) + ".jpg"} alt={name + ' [' + bid + ']'} />
                </a>
                
              </article>;
            })}
          </section>

          <footer id="footer">
            <input placeholder="Movie" className="input" value={this.state.toVote} onChange={this.updateValue.bind(this)}></input>
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
