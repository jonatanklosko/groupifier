import React, { useState, useMemo } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { DragDropContext } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

import CompetitorsPanel, {
  COMPETITORS_PANEL_DROPPABLE_ID,
} from './CompetitorsPanel/CompetitorsPanel';
import GroupActivityEditor from './GroupActivityEditor/GroupActivityEditor';

import { activityCodeToName } from '../../../../logic/activities';
import { toInt } from '../../../../logic/utils';
import { competitorsForRound } from '../../../../logic/competitors';
import {
  newAssignmentError,
  updateAssignments,
  toAssignmentKey,
} from '../../../../logic/assignments';
import {
  sortedGroupActivitiesWithSize,
  updateAssignmentStationNumbers,
} from '../../../../logic/groups';

const useStyles = makeStyles(theme => ({
  scrollDisabled: {
    overflowY: 'initial',
  },
  fullHeightScrollable: {
    height: 'calc(100vh - 64px)',
    overflowY: 'auto',
  },
  leftArea: {
    maxWidth: 250,
  },
  rightArea: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  grow: {
    flexGrow: 1,
  },
}));

const GroupsEditor = ({ roundId, wcif, onClose }) => {
  const classes = useStyles();
  const [localWcif, setLocalWcif] = useState(wcif);
  const [errorMessage, setErrorMessage] = useState(null);

  const groupActivitiesWithSize = useMemo(() => {
    const competitors = competitorsForRound(wcif, roundId) || [];
    return sortedGroupActivitiesWithSize(wcif, roundId, competitors.length);
  }, [wcif, roundId]);

  const handleDragEnd = result => {
    const { draggableId, source, destination } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    const draggableData = draggableId.split(':');
    const personId = toInt(draggableData[0]);
    const assignmentKey = draggableData[1];
    const destinationData = destination.droppableId.split(':');
    const destinationGroupActivityId = toInt(destinationData[0]);
    const destinationAssignmentCode = destinationData[1];
    if (destination.droppableId === COMPETITORS_PANEL_DROPPABLE_ID) {
      setLocalWcif(
        updateAssignments(localWcif, personId, assignments =>
          assignments.filter(
            assignment => toAssignmentKey(assignment) !== assignmentKey
          )
        )
      );
    } else if (source.droppableId === COMPETITORS_PANEL_DROPPABLE_ID) {
      setLocalWcif(
        updateAssignments(localWcif, personId, assignments => {
          const newAssignment = {
            activityId: destinationGroupActivityId,
            assignmentCode: destinationAssignmentCode,
          };
          const errorMessage = newAssignmentError(
            localWcif,
            assignments,
            newAssignment
          );
          if (errorMessage) {
            setErrorMessage(errorMessage);
            return assignments;
          } else {
            return [...assignments, newAssignment];
          }
        })
      );
    } else {
      setLocalWcif(
        updateAssignments(localWcif, personId, assignments => {
          const newAssignment = {
            activityId: destinationGroupActivityId,
            assignmentCode: destinationAssignmentCode,
          };
          const otherAssignments = assignments.filter(
            assignment => toAssignmentKey(assignment) !== assignmentKey
          );
          const errorMessage = newAssignmentError(
            localWcif,
            otherAssignments,
            newAssignment
          );
          if (errorMessage) {
            setErrorMessage(errorMessage);
            return assignments;
          } else {
            return assignments.map(assignment =>
              toAssignmentKey(assignment) === assignmentKey
                ? newAssignment
                : assignment
            );
          }
        })
      );
    }
  };

  return (
    <Dialog open={true} fullScreen classes={{ paper: classes.scrollDisabled }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            {`Editing groups for ${activityCodeToName(roundId)}`}
          </Typography>
          <div className={classes.grow} />
          <Button onClick={() => onClose(wcif)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() =>
              onClose(updateAssignmentStationNumbers(localWcif, roundId))
            }
            color="secondary"
          >
            Done
          </Button>
        </Toolbar>
      </AppBar>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container wrap="nowrap">
          <Grid
            item
            className={classNames(
              classes.fullHeightScrollable,
              classes.leftArea
            )}
          >
            <CompetitorsPanel wcif={localWcif} roundId={roundId} />
          </Grid>
          <Grid
            item
            className={classNames(
              classes.fullHeightScrollable,
              classes.rightArea
            )}
          >
            <Grid container direction="column" spacing={1}>
              {groupActivitiesWithSize.map(([groupActivity, size]) => (
                <Grid item key={groupActivity.id}>
                  <GroupActivityEditor
                    wcif={localWcif}
                    groupActivity={groupActivity}
                    size={size}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </DragDropContext>
      <Snackbar
        open={!!errorMessage}
        message={errorMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={8000}
        onClose={() => setErrorMessage(null)}
      />
    </Dialog>
  );
};

export default GroupsEditor;
