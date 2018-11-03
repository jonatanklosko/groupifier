import React, { PureComponent } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn, pluralize } from '../../../../logic/utils';
import { getExtensionData, setExtensionData } from '../../../../logic/wcif-extensions';

export default class RoundActivityConfig extends PureComponent {
  handlePropertyChange = (property, value) => {
    const { activity, onChange } = this.props;
    onChange(
      setExtensionData('Activity', activity, setIn(getExtensionData('Activity', activity), [property], value))
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
    const { activity, room, expectedCompetitors, disabled } = this.props;
    const { groups, scramblers, runners, assignJudges, capacity } = getExtensionData('Activity', activity);

    const stations = getExtensionData('Room', room).stations;
    const competitors = Math.round(expectedCompetitors.length * capacity);
    const groupSize = Math.round(competitors / groups);

    const groupsHelperText = groups
      ? pluralize(groupSize, 'person', 'people') + ' in group'
      : ' ';
    const scramblersHelperText = scramblers
      ? pluralize(Math.round(groupSize / scramblers), 'cube') + ' per scrambler'
      : ' ';
    const runnersHelperText = runners
      ? pluralize(Math.round(stations / runners), 'station') + ' per runner'
      : ' ';

    return (
      <Grid container direction="column">
        <Grid item>
          <PositiveIntegerInput
            label="Groups"
            value={groups}
            name="groups"
            helperText={groupsHelperText}
            onChange={this.handleInputChange}
            margin="dense"
            disabled={disabled}
          />
        </Grid>
        <Grid item>
          <ZeroablePositiveIntegerInput
            label="Scramblers"
            value={scramblers}
            name="scramblers"
            helperText={scramblersHelperText}
            onChange={this.handleInputChange}
            margin="dense"
            disabled={disabled}
          />
        </Grid>
        <Grid item>
          <ZeroablePositiveIntegerInput
            label="Runners"
            value={runners}
            name="runners"
            helperText={runnersHelperText}
            onChange={this.handleInputChange}
            margin="dense"
            disabled={disabled}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={assignJudges}
                name="assignJudges"
                onChange={this.handleCheckboxChange}
                disabled={disabled}
              />
            }
            label="Assign judges"
          />
        </Grid>
      </Grid>
    );
  }
}
