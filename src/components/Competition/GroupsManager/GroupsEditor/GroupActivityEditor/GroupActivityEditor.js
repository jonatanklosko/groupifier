import React, { Fragment, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
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
    const [hiddenRoles, setHiddenRoles] = useState({});

    const assignmentCodesWithPeople = assignmentCodes.map(assignmentCode => [
      assignmentCode,
      wcif.persons.filter(person =>
        hasAssignment(person, groupActivity.id, assignmentCode)
      ),
    ]);

    const competitors =
      assignmentCodesWithPeople.find(
        ([assignmentCode]) => assignmentCode === COMPETITOR_ASSIGNMENT_CODE
      )?.[1] ?? [];

    const roles = assignmentCodesWithPeople.filter(
      ([assignmentCode]) => assignmentCode !== COMPETITOR_ASSIGNMENT_CODE
    );

    const totalCount = `${competitors.length} of ${size}`;

    const assignmentStatusFor = people =>
      people.length > 0 ? `${people.length} assigned` : 'No one assigned';

    return (
      <Fragment>
        <Typography variant="h5" align="center">
          {activityCodeToGroupName(groupActivity.activityCode)}
        </Typography>

        <FormGroup row>
          {roles.map(([assignmentCode, people]) => {
            const isManuallyHidden = hiddenRoles[assignmentCode] ?? false;
            const isEmpty = people.length === 0;
            const isHidden = isManuallyHidden || isEmpty;
            return (
              <FormControlLabel
                key={assignmentCode}
                control={
                  <Checkbox
                    checked={isManuallyHidden}
                    onChange={e =>
                      setHiddenRoles({
                        ...hiddenRoles,
                        [assignmentCode]: e.target.checked,
                      })
                    }
                  />
                }
                label={`${isHidden ? 'Show' : 'Hide'} ${assignmentName(assignmentCode)}s`}
              />
            );
          })}
        </FormGroup>

        <Grid container spacing={1}>
          {assignmentCodesWithPeople.map(([assignmentCode, people]) => {
            const isCompetitor =
              assignmentCode === COMPETITOR_ASSIGNMENT_CODE;
            const isHidden = hiddenRoles[assignmentCode] ?? false;
            const isEmpty = people.length === 0;

            if (!isCompetitor && (isHidden || isEmpty)) {
              return null;
            }

            return (
              <Grid item xs={12} sm={6} md key={assignmentCode}>
                <Droppable droppableId={`${groupActivity.id}:${assignmentCode}`}>
                  {provided => (
                    <List
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      dense={true}
                      subheader={
                        <ListSubheader disableSticky>
                          {isCompetitor
                            ? `${assignmentName(assignmentCode)}s (${totalCount})`
                            : `${assignmentName(assignmentCode)}s (${assignmentStatusFor(people)})`}
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
            );
          })}
        </Grid>
      </Fragment>
    );
  },
  (prevProps, nextProps) => {
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