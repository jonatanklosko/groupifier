import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import EventPanel from '../EventPanel/EventPanel';
import { populateActivitiesConfig, anyActivityConfigured } from '../../../../logic/activities';

export default class EventsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignScramblers: true,
      assignRunners: true,
      assignJudges: true,
      expandedPanel: null
    };
  }

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.setState({ [name]: checked });
  };

  handleNextClick = () => {
    const { wcif, expectedCompetitorsByRound, onWcifChange } = this.props;
    onWcifChange(populateActivitiesConfig(wcif, expectedCompetitorsByRound, this.state));
  };

  handlePanelChange = (panel, expanded) => {
    this.setState({ expandedPanel: expanded ? panel : null });
  };

  render() {
    const { wcif, expectedCompetitorsByRound, onWcifChange } = this.props;

    return anyActivityConfigured(wcif) ? (
      wcif.events.map(wcifEvent =>
        <EventPanel
          key={wcifEvent.id}
          wcif={wcif}
          wcifEvent={wcifEvent}
          expectedCompetitorsByRound={expectedCompetitorsByRound}
          onWcifChange={onWcifChange}
          expanded={this.state.expandedPanel === wcifEvent.id}
          onPanelChange={this.handlePanelChange}
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
