import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';

import { roomsConfigComplete, activitiesConfigComplete, anyCompetitorAssignment } from '../../../logic/activities';

const menuItems = [
  { path: '/roles', text: "Edit roles", icon: 'perm_contact_calendar', enabled: wcif => true },
  { path: '/config', text: "Configure", icon: 'settings', enabled: wcif => true },
  { path: '/groups', text: "Manage groups", icon: 'people', enabled: wcif => roomsConfigComplete(wcif) && activitiesConfigComplete(wcif) },
  { path: '/printing', text: "Print documents", icon: 'print', enabled: wcif => anyCompetitorAssignment(wcif) }
];

const CompetitionMenu = ({ wcif, baseUrl }) => (
  <Paper>
    <List>
      {menuItems.map(menuItem =>
        <ListItem key={menuItem.path} button component={Link} to={`${baseUrl}${menuItem.path}`} disabled={!menuItem.enabled(wcif)}>
          <ListItemIcon><Icon>{menuItem.icon}</Icon></ListItemIcon>
          <ListItemText primary={menuItem.text} />
        </ListItem>
      )}
    </List>
  </Paper>
);

export default CompetitionMenu;
