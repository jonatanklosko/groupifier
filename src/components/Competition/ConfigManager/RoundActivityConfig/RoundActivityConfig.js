import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn, pluralize } from '../../../../logic/utils';
import {
  getExtensionData,
  setExtensionData,
} from '../../../../logic/wcif-extensions';
import { activityAssigned } from '../../../../logic/activities';

const RoundActivityConfig = React.memo(
  ({ activity, room, wcif, onChange, expectedCompetitors }) => {
    const {
      groups,
      scramblers,
      runners,
      assignJudges,
      capacity,
    } = getExtensionData('ActivityConfig', activity);
    const stations = getExtensionData('RoomConfig', room).stations;
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

    const groupsCreated = activity.childActivities.length > 0;
    const groupsAssigned = activity.childActivities.some(({ id }) =>
      activityAssigned(wcif, id)
    );

    const handlePropertyChange = (property, value) => {
      onChange(
        setExtensionData(
          'ActivityConfig',
          activity,
          setIn(getExtensionData('ActivityConfig', activity), [property], value)
        )
      );
    };

    const handleInputChange = (event, value) => {
      handlePropertyChange(event.target.name, value);
    };

    const handleCheckboxChange = event => {
      const { name, checked } = event.target;
      handlePropertyChange(name, checked);
    };

    return (
      <Grid container direction="column">
        <Grid item>
          <PositiveIntegerInput
            label="Groups"
            value={groups}
            name="groups"
            helperText={groupsHelperText}
            onChange={handleInputChange}
            margin="dense"
            disabled={groupsCreated || groupsAssigned}
          />
        </Grid>
        <Grid item>
          <ZeroablePositiveIntegerInput
            label="Scramblers"
            value={scramblers}
            name="scramblers"
            helperText={scramblersHelperText}
            onChange={handleInputChange}
            margin="dense"
            disabled={groupsAssigned}
          />
        </Grid>
        <Grid item>
          <ZeroablePositiveIntegerInput
            label="Runners"
            value={runners}
            name="runners"
            helperText={runnersHelperText}
            onChange={handleInputChange}
            margin="dense"
            disabled={groupsAssigned}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={assignJudges}
                name="assignJudges"
                onChange={handleCheckboxChange}
                disabled={stations === 0 || groupsAssigned}
              />
            }
            label="Assign judges"
          />
        </Grid>
      </Grid>
    );
  }
);

export default RoundActivityConfig;
