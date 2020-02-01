import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import { Droppable } from 'react-beautiful-dnd';

import DraggableCompetitorAssignments from '../DraggableCompetitorAssignments/DraggableCompetitorAssignments';

import { activityCodeToGroupName } from '../../../../../logic/activities';
import { hasAssignment } from '../../../../../logic/competitors';
import { roles } from '../../../../../logic/roles';

const GroupActivityEditor = React.memo(
  ({ groupActivity, wcif, size }) => {
    const rolesWithPeople = roles.map(role => [
      role,
      wcif.persons.filter(person =>
        hasAssignment(person, groupActivity.id, role.id)
      ),
    ]);

    return (
      <Fragment>
        <Typography variant="h5" align="center">
          {activityCodeToGroupName(groupActivity.activityCode)}
        </Typography>
        <Grid container spacing={1}>
          {rolesWithPeople.map(([role, people]) => (
            <Grid item xs={12} sm={6} md key={role.id}>
              <Droppable droppableId={`${groupActivity.id}:${role.id}`}>
                {provided => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    dense={true}
                    subheader={
                      <ListSubheader disableSticky>
                        {role.id === 'competitor'
                          ? `${role.label} (${people.length} of ${size})`
                          : `${role.label} (${people.length})`}
                      </ListSubheader>
                    }
                  >
                    <DraggableCompetitorAssignments
                      people={people}
                      role={role}
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
    /* Consider props equal if the number of competitors with each role is the same.
       That's a heuristic preventing from re-rendering on unrelated wcif changes. */
    return roles.every(
      role =>
        prevProps.wcif.persons.filter(person =>
          hasAssignment(person, prevProps.groupActivity.id, role.id)
        ).length ===
        nextProps.wcif.persons.filter(person =>
          hasAssignment(person, nextProps.groupActivity.id, role.id)
        ).length
    );
  }
);

export default GroupActivityEditor;
