import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import { setIn } from '../../../../logic/helpers';

export default class EventConfig extends PureComponent {
  handlePropertyChange = (property, value) => {
    const { config, onChange } = this.props;
    onChange(setIn(config, [property], value));
  };

  handleInputChange = (event, value) => {
    this.handlePropertyChange(event.target.name, value);
  };

  handleCheckboxChangeNumerically = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name, checked ? null : 0);
  };

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name, checked);
  };

  render() {
    const { stations, scramblers, runners, generateJudges } = this.props.config;

    return (
      <Grid container direction="column">
        <Grid item>
          <PositiveIntegerInput
            label="Timing stations"
            value={stations}
            name="stations"
            margin="normal"
            onChange={this.handleInputChange}
          />
        </Grid>
        <Grid item>
          <PositiveIntegerInput
            label="Scramblers"
            value={scramblers}
            name="scramblers"
            disabled={scramblers === 0}
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
            value={runners}
            name="runners"
            disabled={runners === 0}
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
            control={
              <Checkbox
                checked={generateJudges}
                name="generateJudges"
                onChange={this.handleCheckboxChange}
              />
            }
            label="Generate judges"
          />
        </Grid>
      </Grid>
    );
  }
}
