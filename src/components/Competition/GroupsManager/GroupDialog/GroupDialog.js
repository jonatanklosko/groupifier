import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { activityCodeToName } from '../../../../logic/activities';
import { sortBy } from '../../../../logic/utils';
import {
  assignmentCodes,
  assignmentName,
  hasAssignment,
} from '../../../../logic/assignments';

const GroupDialog = ({ groupActivity, wcif, onClose }) => {
  const assignmentCodesWithPeople = assignmentCodes
    .map(assignmentCode => [
      assignmentCode,
      wcif.persons.filter(person =>
        hasAssignment(person, groupActivity.id, assignmentCode)
      ),
    ])
    .filter(([assignmentCode, people]) => people.length > 0);

  return (
    <Dialog open={true} onClose={onClose} maxWidth={false}>
      <DialogTitle>
        {activityCodeToName(groupActivity.activityCode)}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          {assignmentCodesWithPeople.map(([assignmentCode, people]) => (
            <Grid item xs={12} sm={6} md key={assignmentCode}>
              <Typography variant="subtitle2">
                {assignmentName(assignmentCode)}s
              </Typography>
              <List dense={true} style={{ overflowY: 'auto', maxHeight: 300 }}>
                {sortBy(people, person => person.name).map(person => (
                  <ListItem key={person.wcaUserId}>
                    <ListItemText primary={person.name} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
          {assignmentCodesWithPeople.length === 0 && (
            <Grid item>
              <Typography variant="body2">
                No assignments for this round.
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupDialog;
