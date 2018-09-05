import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';

import Competition from '../Competition/Competition';
import CompetitionList from '../CompetitionList/CompetitionList';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Home from '../Home/Home';

import { isSignedIn, signIn, signOut } from '../../logic/auth';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: isSignedIn()
    };
  }

  handleSignIn = () => {
    signIn();
  };

  handleSignOut = () => {
    signOut();
    this.setState({ isSignedIn: false })
  };

  render() {
    return (
      <Router>
        <div>
          <CssBaseline />
          <Header
            isSignedIn={this.state.isSignedIn}
            onSignIn={this.handleSignIn}
            onSignOut={this.handleSignOut}
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
          <Route exact path="/" component={Footer} />
        </div>
      </Router>
    );
  }
}
