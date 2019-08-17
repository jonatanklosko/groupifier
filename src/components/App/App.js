import React, { Component } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';

import history from '../../logic/history';
import Competition from '../Competition/Competition';
import CompetitionList from '../CompetitionList/CompetitionList';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Home from '../Home/Home';

import { isSignedIn, signIn, signOut } from '../../logic/auth';

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: grey
  },
});

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
    const { isSignedIn } = this.state;
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <CssBaseline />
            <Header
              isSignedIn={isSignedIn}
              onSignIn={this.handleSignIn}
              onSignOut={this.handleSignOut}
            />
            <Grid container justify="center" style={{ flexGrow: 1 }}>
              <Grid item xs={12} md={8} style={{ padding: 16 }}>
                {isSignedIn ? (
                  <Switch>
                    <Route path="/competitions/:competitionId" component={Competition} />
                    <Route path="/competitions" component={CompetitionList} />
                    <Redirect to="/competitions" />
                  </Switch>
                ) : (
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Redirect to="/" />
                  </Switch>
                )}
              </Grid>
            </Grid>
            <Footer />
          </div>
        </ThemeProvider>
      </Router>
    );
  }
}
