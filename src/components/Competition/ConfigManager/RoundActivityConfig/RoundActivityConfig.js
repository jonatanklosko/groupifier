import React, { PureComponent } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn, pluralize } from '../../../../logic/helpers';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';

export default class RoundActivityConfig extends PureComponent {
  handlePropertyChange = (property, value) => {
    const { activity, onChange } = this.props;
    onChange(
      setGroupifierData('Activity', activity, setIn(getGroupifierData(activity), [property], value))
    );
  };

  handleInputChange = (event, value) => {
    this.handlePropertyChange(event.target.name, value);
  };

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name, checked);
  };

  render() {
    const { activity, expectedCompetitors } = this.props;
    const { groups, scramblers, runners, assignJudges, density } = getGroupifierData(activity);

    const competitors = Math.floor(expectedCompetitors.length * density);
    const groupSizeText = groups
      ? pluralize(Math.ceil(competitors / groups), 'person', 'people') + ' in group'
      : '';

    return (
      <Grid container direction="column">
        <Grid item>
          <PositiveIntegerInput
            label="Groups"
            value={groups}
            name="groups"
            helperText={groupSizeText}
            onChange={this.handleInputChange}
          />
        </Grid>
        <Grid item>
          <ZeroablePositiveIntegerInput
            label="Scramblers"
            value={scramblers}
            name="scramblers"
            onChange={this.handleInputChange}
          />
        </Grid>
        <Grid item>
          <ZeroablePositiveIntegerInput
            label="Runners"
            value={runners}
            name="runners"
            onChange={this.handleInputChange}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={assignJudges}
                name="assignJudges"
                onChange={this.handleCheckboxChange}
              />
            }
            label="Assign judges"
          />
        </Grid>
      </Grid>
    );
  }
}
