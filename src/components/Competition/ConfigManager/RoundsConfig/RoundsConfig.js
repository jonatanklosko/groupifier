import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoundConfig from '../RoundConfig/RoundConfig';
import { populateRoundActivitiesConfig, anyActivityConfig, hasDistributedAttempts } from '../../../../logic/activities';

export default class RoundsConfig extends Component {
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
    const { wcif, expectedCompetitorsByRound, onWcifChange } = this.props;
    onWcifChange(populateRoundActivitiesConfig(wcif, expectedCompetitorsByRound, this.state));
  };

  render() {
    const { wcif } = this.props;
    const events = wcif.events.filter(event => !hasDistributedAttempts(event.id));

    return anyActivityConfig(wcif) ? (
      <RoundsNavigation events={events} render={this.renderRound} />
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="h5">Generate configuration</Typography>
        <Grid container direction="column">
          <Grid item style={{ margin: '0.5em 0' }}>
            <Typography variant="body1">
              Which of the following roles would you like to assign?
            </Typography>
          </Grid>
          {['Scramblers', 'Runners', 'Judges'].map(roleLabel =>
            <Grid item key={roleLabel}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state[`assign${roleLabel}`]}
                    name={`assign${roleLabel}`}
                    onChange={this.handleCheckboxChange}
                  />
                }
                label={roleLabel}
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

  renderRound = roundId => {
    const { wcif, expectedCompetitorsByRound, onWcifChange } = this.props;

    return (
      <RoundConfig
        roundId={roundId}
        expectedCompetitorsByRound={expectedCompetitorsByRound}
        wcif={wcif}
        onWcifChange={onWcifChange}
      />
    );
  };
}
