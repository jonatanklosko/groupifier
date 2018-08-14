import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';

const menuItems = [
  { path: '/roles', text: "Edit roles", icon: 'perm_contact_calendar' },
  { path: '/config', text: "Configure", icon: 'settings' },
  { path: '/groupify', text: "Create groups", icon: 'people' }
];

const CompetitionMenu = ({ baseUrl }) => (
  <Paper>
    <List>
      {menuItems.map(menuItem =>
        <ListItem key={menuItem.path} button component={Link} to={`${baseUrl}${menuItem.path}`}>
          <ListItemIcon><Icon>{menuItem.icon}</Icon></ListItemIcon>
          <ListItemText primary={menuItem.text} />
        </ListItem>
      )}
    </List>
  </Paper>
);

export default CompetitionMenu;
