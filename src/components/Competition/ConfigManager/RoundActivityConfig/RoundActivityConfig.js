import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import ZeroablePositiveIntegerInput from '../../../common/ZeroablePositiveIntegerInput/ZeroablePositiveIntegerInput';
import { setIn, pluralize } from '../../../../logic/utils';
import {
  getExtensionData,
  setExtensionData,
} from '../../../../logic/wcif-extensions';
import { activityAssigned } from '../../../../logic/activities';

const DisabledReasonTooltip = ({ children, reasons }) => {
  const trueReasons = Object.keys(reasons).filter(reason => reasons[reason]);

  const message =
    trueReasons.length === 0
      ? ''
      : `Disabled for the following reasons: ${trueReasons.join(', ')}`;

  return (
    <Tooltip title={message} placement="right">
      {children}
    </Tooltip>
  );
};

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
      ? pluralize(
          Math.round(Math.min(stations, groupSize) / runners),
          'station'
        ) + ' per runner'
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
          <DisabledReasonTooltip
            reasons={{
              'groups already created': groupsCreated,
              'groups already assigned': groupsAssigned,
            }}
          >
            <PositiveIntegerInput
              label="Groups"
              value={groups}
              name="groups"
              helperText={groupsHelperText}
              onChange={handleInputChange}
              margin="dense"
              disabled={groupsCreated || groupsAssigned}
            />
          </DisabledReasonTooltip>
        </Grid>
        <Grid item>
          <DisabledReasonTooltip
            reasons={{ 'groups already assigned': groupsAssigned }}
          >
            <ZeroablePositiveIntegerInput
              label="Scramblers"
              value={scramblers}
              name="scramblers"
              helperText={scramblersHelperText}
              onChange={handleInputChange}
              margin="dense"
              disabled={groupsAssigned}
            />
          </DisabledReasonTooltip>
        </Grid>
        <Grid item>
          <DisabledReasonTooltip
            reasons={{ 'groups already assigned': groupsAssigned }}
          >
            <ZeroablePositiveIntegerInput
              label="Runners"
              value={runners}
              name="runners"
              helperText={runnersHelperText}
              onChange={handleInputChange}
              margin="dense"
              disabled={groupsAssigned}
            />
          </DisabledReasonTooltip>
        </Grid>
        <Grid item>
          <DisabledReasonTooltip
            reasons={{
              'there are no stations': stations === 0,
              'groups already assigned': groupsAssigned,
            }}
          >
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
          </DisabledReasonTooltip>
        </Grid>
      </Grid>
    );
  }
);

export default RoundActivityConfig;
