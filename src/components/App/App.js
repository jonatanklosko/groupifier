import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import CssBaseline from 'material-ui/CssBaseline';
import Grid from 'material-ui/Grid';

import Competition from '../Competition/Competition';
import CompetitionList from '../CompetitionList/CompetitionList';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Home from '../Home/Home';

import Auth from '../../logic/Auth';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: Auth.isSignedIn()
    };
  }

  handleSignIn() {
    Auth.signIn();
  }

  handleSignOut() {
    Auth.signOut();
    this.setState({ isSignedIn: false })
  }

  render() {
    return (
      <Router>
        <div>
          <CssBaseline />
          <Header
            isSignedIn={this.state.isSignedIn}
            onSignIn={this.handleSignIn.bind(this)}
            onSignOut={this.handleSignOut.bind(this)}
          />
          <Grid container justify="center">
            <Grid item xs={12} md={8} style={{ padding: 16 }}>
              {this.state.isSignedIn
                ? <Switch>
                    <Route path="/competitions/:competitionId" component={Competition} />
                    <Route path="/competitions" component={CompetitionList} />
                    <Redirect to="/competitions" />
                  </Switch>
                : <Switch>
                    <Route exact path="/" component={Home} />
                    <Redirect to="/" />
                  </Switch>
              }
            </Grid>
          </Grid>
          <Route exact path="/" component={Footer}/>
        </div>
      </Router>
    );
  }
}
