import React, { useState } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import blue from '@material-ui/core/colors/blue';
import { makeStyles } from '@material-ui/core/styles';

import history from '../../logic/history';
import Competition from '../Competition/Competition';
import CompetitionList from '../CompetitionList/CompetitionList';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Home from '../Home/Home';

import { isSignedIn, signIn, signOut } from '../../logic/auth';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blueGrey[900],
    },
    secondary: blue,
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  grow: {
    flexGrow: 1,
  },
  main: {
    padding: theme.spacing(2),
  },
}));

const App = () => {
  const classes = useStyles();
  const [signedIn, setSignedIn] = useState(isSignedIn());

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = () => {
    signOut();
    setSignedIn(false);
  };

  return (
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline />
          <Header
            isSignedIn={signedIn}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
          />
          <Grid container justify="center" className={classes.grow}>
            <Grid item xs={12} md={8} xl={6} className={classes.main}>
              {signedIn ? (
                <Switch>
                  <Route
                    path="/competitions/:competitionId"
                    component={Competition}
                  />
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
};

export default App;
