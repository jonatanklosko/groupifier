import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import RoundConfig from '../RoundConfig/RoundConfig';
import { setIn } from '../../../../logic/helpers';

export default class EventConfig extends PureComponent {
  constructor(props) {
    super(props);

    const { eventId, wcifEvents = [] } = props;
    this.roundIds = wcifEvents
      .filter(wcifEvent => wcifEvent.id !== eventId)
      .reduce((roundIds, wcifEvent) =>
        roundIds.concat(wcifEvent.rounds.map(round => round.id))
      , []);
  }

  handlePropertyChange = (propertyPath, value) => {
    const { eventId, config, onChange } = this.props;
    onChange(setIn(config, propertyPath, value), eventId);
  };

  handleInputChange = (event, value) => {
    this.handlePropertyChange(event.target.name.split('.'), value);
  };

  handleCheckboxChangeNumerically = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name.split('.'), checked ? null : 0);
  };

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name.split('.'), checked);
  };

  handleRoundConfigChange = (roundConfig, roundId) => {
    this.handlePropertyChange(['configByRound', roundId], roundConfig);
  };

  render() {
    const { config, competitorsByRound } = this.props;
    const { stations, scramblers, runners, generateJudges } = config;

    return (
      <Grid container>
        <Grid item xs={12} md={6}>
          <Grid container direction="column">
            <Grid item>
              <PositiveIntegerInput
                margin="normal"
                label="Timing stations"
                value={stations}
                name="stations"
                onChange={this.handleInputChange}
              />
            </Grid>
            <Grid item>
              <PositiveIntegerInput
                label="Scramblers"
                disabled={scramblers === 0}
                value={scramblers}
                name="scramblers"
                onChange={this.handleInputChange}
              />
              <Checkbox
                checked={scramblers !== 0}
                name="scramblers"
                onChange={this.handleCheckboxChangeNumerically}
              />
            </Grid>
            <Grid item>
              <PositiveIntegerInput
                label="Runners"
                disabled={runners === 0}
                value={runners}
                name="runners"
                onChange={this.handleInputChange}
              />
              <Checkbox
                checked={runners !== 0}
                name="runners"
                onChange={this.handleCheckboxChangeNumerically}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={generateJudges} name="generateJudges" onChange={this.handleCheckboxChange} />}
                label="Generate judges"
              />
            </Grid>
          </Grid>
        </Grid>
        {config.configByRound && (
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={16}>
              {Object.entries(config.configByRound).map(([roundId, roundConfig], index) =>
                <Grid item key={roundId}>
                  <RoundConfig
                    roundId={roundId}
                    config={roundConfig}
                    label={`Round ${index + 1}`}
                    roundIds={this.roundIds}
                    onChange={this.handleRoundConfigChange}
                    competitorsByRound={competitorsByRound}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    )
  }
}
