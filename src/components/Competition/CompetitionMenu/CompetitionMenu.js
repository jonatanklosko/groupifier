import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'material-ui/Icon';
import List, { ListItem, ListItemText, ListItemIcon } from 'material-ui/List';
import Paper from 'material-ui/Paper';

const menuItems = [
  { path: '/roles', text: "Edit roles", icon: 'perm_contact_calendar' },
  { path: '/config', text: "Configure groups", icon: 'settings' },
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
