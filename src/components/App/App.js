import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import CssBaseline from 'material-ui/CssBaseline';
import Grid from 'material-ui/Grid';

import Header from '../Header/Header';
import Home from '../Home/Home';

const App = () => (
  <Router>
    <div>
      <CssBaseline />
      <Header />
      <Grid container justify="center">
        <Grid item xs={12} md={8} style={{ padding: 16 }}>
          <Route exact path="/" component={Home}/>
        </Grid>
      </Grid>
    </div>
  </Router>
);

export default App;
