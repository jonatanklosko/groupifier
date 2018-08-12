import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Grid from 'material-ui/Grid';
import { FormControlLabel } from 'material-ui/Form';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import EventPanel from '../EventPanel/EventPanel';
import { differ, isPresentDeep } from '../../../../logic/helpers';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';
import { suggestedGroupCount } from '../../../../logic/groups';

export default class EventsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runners: false,
      assignJudges: false
    };
  }

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.setState({ [name]: checked });
  };

  handleNext = () => {
    const { wcif, competitorsByRound } = this.props;
  };

  render() {
    const { runners, assignJudges } = this.state;
    const { wcif, competitorsByRound } = this.props;

    const showEventsConfig = wcif.events.some(wcifEvent => getGroupifierData(wcifEvent));

    return showEventsConfig ? (
      wcif.events.map(wcifEvent =>
        <EventPanel
          key={wcifEvent.id}
          wcif={wcif}
          wcifEvent={wcifEvent}
          competitorsByRound={competitorsByRound}
          onChange={this.handleEventChange}
        />
      )
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="headline">Generate configuration</Typography>
        <Grid container direction="column">
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox checked={runners} name="runners" onChange={this.handleCheckboxChange} />
              }
              label="Do you use runners system?"
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox checked={assignJudges} name="assignJudges" onChange={this.handleCheckboxChange} />
              }
              label="Should judges be assigned?"
            />
          </Grid>
        </Grid>
        <Button onClick={this.handleNext}>
          Next
        </Button>
      </Paper>
    );
  }
}
