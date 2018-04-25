import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';

import EventsConfig from './EventsConfig/EventsConfig';

export default class ConfigManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localWcif: props.wcif,
      tabValue: 0
    }
  }

  handleWcifChange = wcif => {
    this.setState({ localWcif: wcif });
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  render() {
    const { tabValue, localWcif } = this.state;
    const { onWcifUpdate } = this.props;

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <AppBar position="static" color="default">
            <Tabs value={tabValue} onChange={this.handleTabChange} centered>
              <Tab label="Events" />
              <Tab label="General" />
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item xs={12}>
          {tabValue === 0 && (
            <EventsConfig wcif={localWcif} onWcifChange={this.handleWcifChange} />
          )}
          {tabValue === 1 && (
            <Paper>
              <Typography>General settings</Typography>
            </Paper>
          )}
        </Grid>
        <Grid item>
          <Button variant="raised" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="raised"
            color="primary"
            onClick={() => onWcifUpdate(localWcif)}
            component={Link}
            to={`/competitions/${localWcif.id}`}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
