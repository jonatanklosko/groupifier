import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';

import Scorecards from './Scorecards/Scorecards';
import CompetitorCards from './CompetitorCards/CompetitorCards';
import { __withCubecompsIds__ } from '../../../logic/__cubecomps__';

export default class PrintingManager extends Component {
  state = {
    tabValue: 0,
    wcif: null
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  handleWcifChange = (event) => {
    try {
      const parsed = JSON.parse(event.target.value);
      __withCubecompsIds__(parsed).then(wcif =>
        this.setState({ wcif })
      );
    } catch {
      this.setState({ wcif: null })
    }
  };

  render() {
    const { tabValue } = this.state;
    const { wcif } = this.state;

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Paste WCIF"
            value={wcif ? JSON.stringify(wcif) : ''}
            onChange={this.handleWcifChange}
          />
        </Grid>
        {wcif && (
          <React.Fragment>
            <Grid item xs={12}>
              <AppBar position="static" color="default">
                <Tabs value={tabValue} onChange={this.handleTabChange} centered>
                  <Tab label="Scorecards" />
                  <Tab label="Competitor cards" />
                </Tabs>
              </AppBar>
            </Grid>
            <Grid item xs={12}>
              {tabValue === 0 && <Scorecards wcif={wcif} />}
              {tabValue === 1 && <CompetitorCards wcif={wcif} />}
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" component={Link} to={`/competitions/${wcif.id}`}>
                Done
              </Button>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    );
  }
}
