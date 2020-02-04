import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import { Droppable } from 'react-beautiful-dnd';

import DraggableCompetitorAssignments from '../DraggableCompetitorAssignments/DraggableCompetitorAssignments';

import { activityCodeToGroupName } from '../../../../../logic/activities';
import {
  assignmentCodes,
  COMPETITOR_ASSIGNMENT_CODE,
  assignmentName,
  hasAssignment,
} from '../../../../../logic/assignments';

const GroupActivityEditor = React.memo(
  ({ groupActivity, wcif, size }) => {
    const assignmentCodesWithPeople = assignmentCodes.map(assignmentCode => [
      assignmentCode,
      wcif.persons.filter(person =>
        hasAssignment(person, groupActivity.id, assignmentCode)
      ),
    ]);

    return (
      <Fragment>
        <Typography variant="h5" align="center">
          {activityCodeToGroupName(groupActivity.activityCode)}
        </Typography>
        <Grid container spacing={1}>
          {assignmentCodesWithPeople.map(([assignmentCode, people]) => (
            <Grid item xs={12} sm={6} md key={assignmentCode}>
              <Droppable droppableId={`${groupActivity.id}:${assignmentCode}`}>
                {provided => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    dense={true}
                    subheader={
                      <ListSubheader disableSticky>
                        {assignmentCode === COMPETITOR_ASSIGNMENT_CODE
                          ? `${assignmentName(assignmentCode)}s (${
                              people.length
                            } of ${size})`
                          : `${assignmentName(assignmentCode)}s (${
                              people.length
                            })`}
                      </ListSubheader>
                    }
                  >
                    <DraggableCompetitorAssignments
                      people={people}
                      assignmentCode={assignmentCode}
                      groupActivity={groupActivity}
                    />
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </Fragment>
    );
  },
  (prevProps, nextProps) => {
    /* Consider props equal if the number of competitors with each assignment type is the same.
       That's a heuristic preventing from re-rendering on unrelated wcif changes. */
    return assignmentCodes.every(
      assignmentCode =>
        prevProps.wcif.persons.filter(person =>
          hasAssignment(person, prevProps.groupActivity.id, assignmentCode)
        ).length ===
        nextProps.wcif.persons.filter(person =>
          hasAssignment(person, nextProps.groupActivity.id, assignmentCode)
        ).length
    );
  }
);

export default GroupActivityEditor;
