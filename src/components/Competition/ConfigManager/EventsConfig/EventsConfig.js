import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import EventPanel from '../EventPanel/EventPanel';
import { getGroupifierData } from '../../../../logic/wcifExtensions';
import { populateActivitiesConfig, anyActivityConfigured } from '../../../../logic/activities';

export default class EventsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignScramblers: true,
      assignRunners: true,
      assignJudges: true
    };
  }

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.setState({ [name]: checked });
  };

  handleNextClick = () => {
    const { wcif, competitorsByRound, onWcifChange } = this.props;
    onWcifChange(populateActivitiesConfig(wcif, competitorsByRound, this.state));
  };

  render() {
    const { wcif, competitorsByRound } = this.props;

    return anyActivityConfigured(wcif) ? (
      wcif.events.map(wcifEvent =>
        <EventPanel
          key={wcifEvent.id}
          wcif={wcif}
          wcifEvent={wcifEvent}
          competitorsByRound={competitorsByRound}
          onWcifChange={this.props.onWcifChange}
        />
      )
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="headline">Generate configuration</Typography>
        <Grid container direction="column">
          {[['scramblers', 'assignScramblers'], ['runners', 'assignRunners'], ['judges', 'assignJudges']].map(([role, property]) =>
            <Grid item key={role}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state[property]}
                    name={property}
                    onChange={this.handleCheckboxChange}
                  />
                }
                label={`Should ${role} be assigned?`}
              />
            </Grid>
          )}
        </Grid>
        <Button onClick={this.handleNextClick}>
          Next
        </Button>
      </Paper>
    );
  }
}
