import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoundConfig from '../RoundConfig/RoundConfig';
import { populateActivitiesConfig, anyActivityConfigured } from '../../../../logic/activities';

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
    onWcifChange(populateActivitiesConfig(wcif, expectedCompetitorsByRound, this.state));
  };

  render() {
    const { wcif } = this.props;

    return anyActivityConfigured(wcif) ? (
      <RoundsNavigation events={wcif.events} render={this.renderRound} />
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="h5">Generate configuration</Typography>
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
