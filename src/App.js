import React, { Component } from 'react'
import SciFiContract from '../build/contracts/SciFi.json'
import getWeb3 from './utils/getWeb3'
import { mainInit } from '../public/assets/js/main';

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
      toVote: 'New Movie',
      web3: null,
      sciFiInstance: null,
      account: null
    }
  }

  componentDidMount() {
    mainInit.init();
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

  render() {
    return (
      <div className="App">
        <div id="main">

          <header id="header">
            <h1>Smart Movie Voting</h1>
            <p>Pay to win!</p>
            <p>The movies are:</p>
            <ul>
              {this.state.movies.map(function (name, index) {
                return <li key={index}>{name}</li>;
              })}
            </ul>

          </header>

          <section id="thumbnails">
            <article>
              <a className="thumbnail" href="images/fulls/01.jpg" data-position="left center"><img src="images/thumbs/01.jpg" alt="" /></a>
              <h2>Diam tempus accumsan</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/02.jpg"><img src="images/thumbs/02.jpg" alt="" /></a>
              <h2>Vivamus convallis libero</h2>
              <p>Sed velit lacus, laoreet at venenatis convallis in lorem tincidunt.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/03.jpg" data-position="top center"><img src="images/thumbs/03.jpg" alt="" /></a>
              <h2>Nec accumsan enim felis</h2>
              <p>Maecenas eleifend tellus ut turpis eleifend, vitae pretium faucibus.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/04.jpg"><img src="images/thumbs/04.jpg" alt="" /></a>
              <h2>Donec maximus nisi eget</h2>
              <p>Tristique in nulla vel congue. Sed sociis natoque parturient nascetur.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/05.jpg" data-position="top center"><img src="images/thumbs/05.jpg" alt="" /></a>
              <h2>Nullam vitae nunc vulputate</h2>
              <p>In pellentesque cursus velit id posuere. Donec vehicula nulla.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/06.jpg"><img src="images/thumbs/06.jpg" alt="" /></a>
              <h2>Phasellus magna faucibus</h2>
              <p>Nulla dignissim libero maximus tellus varius dictum ut posuere magna.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/07.jpg"><img src="images/thumbs/07.jpg" alt="" /></a>
              <h2>Proin quis mauris</h2>
              <p>Etiam ultricies, lorem quis efficitur porttitor, facilisis ante orci urna.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/08.jpg"><img src="images/thumbs/08.jpg" alt="" /></a>
              <h2>Gravida quis varius enim</h2>
              <p>Nunc egestas congue lorem. Nullam dictum placerat ex sapien tortor mattis.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/09.jpg"><img src="images/thumbs/09.jpg" alt="" /></a>
              <h2>Morbi eget vitae adipiscing</h2>
              <p>In quis vulputate dui. Maecenas metus elit, dictum praesent lacinia lacus.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/10.jpg"><img src="images/thumbs/10.jpg" alt="" /></a>
              <h2>Habitant tristique senectus</h2>
              <p>Vestibulum ante ipsum primis in faucibus orci luctus ac tincidunt dolor.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/11.jpg"><img src="images/thumbs/11.jpg" alt="" /></a>
              <h2>Pharetra ex non faucibus</h2>
              <p>Ut sed magna euismod leo laoreet congue. Fusce congue enim ultricies.</p>
            </article>
            <article>
              <a className="thumbnail" href="images/fulls/12.jpg"><img src="images/thumbs/12.jpg" alt="" /></a>
              <h2>Mattis lorem sodales</h2>
              <p>Feugiat auctor leo massa, nec vestibulum nisl erat faucibus, rutrum nulla.</p>
            </article>
          </section>

          <footer id="footer">
            <input className="input" value={this.state.toVote} onChange={this.updateValue.bind(this)}></input>
            <button className="xsmall button" onClick={this.voteFromButton.bind(this)}>Vote</button>
            <ul className="copyright">
              <li>&copy; <a href="https://thebetterplatform.com" target="_blank">TheBetterPlatform</a>.</li>
            </ul>
          </footer>

        </div>


      </div>
    );
  }
}

export default App
