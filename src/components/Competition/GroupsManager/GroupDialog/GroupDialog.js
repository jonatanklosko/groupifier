import React, { Component } from 'react';
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
import { hasAssignment } from '../../../../logic/competitors';
import { sortBy } from '../../../../logic/utils';

export default class GroupDialog extends Component {
  render() {
    const { wcif, groupActivity, onClose, open } = this.props;

    const roles = [
      { id: 'competitor', label: 'Competitors' },
      { id: 'staff-scrambler', label: 'Scramblers' },
      { id: 'staff-runner', label: 'Runners' },
      { id: 'staff-judge', label: 'Judges' },
    ];

    const rolesWithPeople = roles.map(role => [
      role,
      wcif.persons.filter(person =>
        hasAssignment(person, groupActivity.id, role.id)
      )
    ])
    .filter(([role, people]) => people.length > 0);

    return (
      <Dialog open={open} onClose={onClose} maxWidth={false}>
        <DialogTitle>{activityCodeToName(groupActivity.activityCode)}</DialogTitle>
        <DialogContent>
          <Grid container spacing={16}>
            {rolesWithPeople.map(([role, people]) => (
              <Grid item xs={12} sm={6} md key={role.id}>
                <Typography variant="subtitle2">{role.label}</Typography>
                <List dense={true} style={{ overflowY: 'auto', maxHeight: 300 }}>
                  {sortBy(people, person => person.name).map(person => (
                    <ListItem key={person.wcaUserId}>
                      <ListItemText primary={person.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
            {rolesWithPeople.length === 0 && (
              <Grid item>
                <Typography variant="body2">No assignments for this round.</Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
