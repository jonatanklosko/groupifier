import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import { setIn } from '../../../../logic/helpers';

export default class EventConfig extends PureComponent {
  handlePropertyChange = (propertyPath, value) => {
    const { config, onChange } = this.props;
    onChange(setIn(config, propertyPath, value));
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

  render() {
    const { stations, scramblers, runners, generateJudges } = this.props.config;

    return (
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
    );
  }
}
