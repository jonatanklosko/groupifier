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
import RoundsConfig from './RoundsConfig/RoundsConfig';
import { getExpectedCompetitorsByRound } from '../../../logic/competitors';
import { roomsConfigComplete, activitiesConfigComplete, anyGroupAssignedOrCreated } from '../../../logic/activities';
import { removeExtensionData } from '../../../logic/wcif-extensions';
import { mapIn } from '../../../logic/utils';

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

  handleDoneClick = () => {
    const { localWcif } = this.state;
    const { onWcifUpdate } = this.props;
    onWcifUpdate(localWcif);
  };

  clearConfig = () => {
    const { localWcif } = this.state;
    this.setState({
      tabValue: 0,
      localWcif: mapIn(localWcif, ['schedule', 'venues', '0', 'rooms'], room =>
        removeExtensionData(
          'Room',
          mapIn(room, ['activities'], activity => removeExtensionData('Activity', activity))
        )
      )
    });
  };

  render() {
    const { tabValue, localWcif } = this.state;

    const wcifConfigComplete = roomsConfigComplete(localWcif) && activitiesConfigComplete(localWcif);

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <AppBar position="static" color="default">
            <Tabs value={tabValue} onChange={this.handleTabChange} centered>
              <Tab label="Rooms" />
              <Tab label="Rounds" disabled={!roomsConfigComplete(localWcif)} />
              <Tab label="General" />
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item xs={12}>
          {tabValue === 0 && (
            <RoomsConfig wcif={localWcif} onWcifChange={this.handleWcifChange} />
          )}
          {tabValue === 1 && (
            <RoundsConfig wcif={localWcif} onWcifChange={this.handleWcifChange} expectedCompetitorsByRound={this.expectedCompetitorsByRound} />
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
          <Button variant="contained" onClick={this.clearConfig} disabled={anyGroupAssignedOrCreated(localWcif)}>
            Clear
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleDoneClick}
            component={Link}
            to={`/competitions/${localWcif.id}`}
            disabled={!wcifConfigComplete}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
