import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import RoomsConfig from './RoomsConfig/RoomsConfig';
import EventsConfig from './EventsConfig/EventsConfig';
import { getExtensionData } from '../../../logic/wcif-extensions';
import { getExpectedCompetitorsByRound } from '../../../logic/competitors';
import { isPresentDeep } from '../../../logic/utils';
import { isActivityConfigurable } from '../../../logic/activities';

export default class ConfigManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localWcif: props.wcif,
      tabValue: 0
    };
    this.expectedCompetitorsByRound = getExpectedCompetitorsByRound(props.wcif);
  }

  handleWcifChange = wcif => {
    this.setState({ localWcif: wcif });
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  wcifConfigComplete() {
    return this.state.localWcif.schedule.venues[0].rooms.every(room => {
      const config = getExtensionData('Room', room);
      const activitiesConfig = room.activities
        .filter(isActivityConfigurable)
        .map(activity => getExtensionData('Activity', activity));
      return isPresentDeep(config) && activitiesConfig.every(isPresentDeep);
    });
  }

  roomsConfigComplete() {
    return this.state.localWcif.schedule.venues[0].rooms
      .map(room => getExtensionData('Room', room))
      .every(isPresentDeep);
  }

  render() {
    const { tabValue, localWcif } = this.state;
    const { onWcifUpdate } = this.props;

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <AppBar position="static" color="default">
            <Tabs value={tabValue} onChange={this.handleTabChange} centered>
              <Tab label="Rooms" />
              <Tab label="Events" disabled={!this.roomsConfigComplete()} />
              <Tab label="General" />
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item xs={12}>
          {tabValue === 0 && (
            <RoomsConfig wcif={localWcif} onWcifChange={this.handleWcifChange} />
          )}
          {tabValue === 1 && (
            <EventsConfig wcif={localWcif} onWcifChange={this.handleWcifChange} expectedCompetitorsByRound={this.expectedCompetitorsByRound} />
          )}
          {tabValue === 2 && (
            <Paper>
              <Typography>General settings</Typography>
            </Paper>
          )}
        </Grid>
        <Grid item>
          <Button variant="contained" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onWcifUpdate(localWcif)}
            component={Link}
            to={`/competitions/${localWcif.id}`}
            disabled={!this.wcifConfigComplete()}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
