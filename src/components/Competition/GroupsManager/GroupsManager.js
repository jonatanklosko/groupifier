import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Tooltip from '@material-ui/core/Tooltip';
import pink from '@material-ui/core/colors/pink';

import GroupsNavigation from './GroupsNavigation/GroupsNavigation';
import SaveWcifButton from '../../common/SaveWcifButton/SaveWcifButton';

import {
  createGroupActivities,
  updateScrambleSetCount,
  assignTasks,
} from '../../../logic/groups';
import {
  allGroupsCreated,
  roundsMissingAssignments,
  clearGroupsAndAssignments,
} from '../../../logic/activities';

const GroupsManager = ({ wcif, onWcifUpdate }) => {
  const [localWcif, setLocalWcif] = useState(wcif);

  const handleCreateGroupActivities = () => {
    setLocalWcif(updateScrambleSetCount(createGroupActivities(localWcif)));
  };

  const handleAssignTasks = () => {
    setLocalWcif(assignTasks(localWcif));
  };

  const handleClearGroups = () => {
    setLocalWcif(clearGroupsAndAssignments(localWcif));
  };

  const groupsCreated = allGroupsCreated(localWcif);

  return (
    <Grid container spacing={1} justify="flex-end">
      <Grid item xs={12}>
        {!groupsCreated && (
          <SnackbarContent
            style={{ maxWidth: 'none' }}
            message="To assign tasks you need to create groups first. This will also determine scramble set count for each round."
            action={
              <Button
                onClick={handleCreateGroupActivities}
                style={{ color: pink[500] }}
                size="small"
              >
                Create groups
              </Button>
            }
          />
        )}
        {groupsCreated && roundsMissingAssignments(localWcif).length > 0 && (
          <SnackbarContent
            style={{ maxWidth: 'none' }}
            message="There are rounds with no tasks assigned."
            action={
              <Button
                onClick={handleAssignTasks}
                style={{ color: pink[500] }}
                size="small"
              >
                Assign tasks
              </Button>
            }
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <GroupsNavigation wcif={localWcif} />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          component={Link}
          to={`/competitions/${localWcif.id}`}
        >
          Cancel
        </Button>
      </Grid>
      <Grid item>
        <Tooltip
          title="This clears groups and assignments only for rounds without results."
          placement="bottom"
        >
          <Button variant="contained" onClick={handleClearGroups}>
            Clear
          </Button>
        </Tooltip>
      </Grid>
      <Grid item>
        <SaveWcifButton
          wcif={wcif}
          updatedWcif={localWcif}
          onWcifUpdate={onWcifUpdate}
        />
      </Grid>
    </Grid>
  );
};

export default GroupsManager;
