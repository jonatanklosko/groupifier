import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import { setIn } from '../../../../logic/helpers';

export default class EventConfig extends PureComponent {
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
                  <Typography variant="body2">Round {index + 1}</Typography>
                  <PositiveIntegerInput
                    label="Groups"
                    helperText="X people in group"
                    value={roundConfig.groups}
                    name={`configByRound.${roundId}.groups`}
                    onChange={this.handleInputChange}
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
