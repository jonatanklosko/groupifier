import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';

import RoundConfig from '../RoundConfig/RoundConfig';
import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
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

  handleInputChange = (value, event) => {
    const { eventId, config, onChange } = this.props;
    onChange(
      setIn(config, event.target.name.split('.'), value),
      eventId
    );
  };

  handleCheckboxChangeNumerically = event => {
    this.handleInputChange(event.target.checked ? null : 0, event);
  };

  handleCheckboxChange = event => {
    this.handleInputChange(event.target.checked, event);
  };

  handleRoundConfigChange = (roundConfig, roundId) => {
    const { eventId, config, onChange } = this.props;
    onChange(
      setIn(config, ['configByRound', roundId], roundConfig),
      eventId
    );
  }

  render() {
    const { config } = this.props;
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
