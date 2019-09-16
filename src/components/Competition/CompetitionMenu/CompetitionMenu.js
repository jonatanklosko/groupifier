import React from 'react';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PeopleIcon from '@material-ui/icons/People';
import PermContactCalendarIcon from '@material-ui/icons/PermContactCalendar';
import PrintIcon from '@material-ui/icons/Print';
import SettingsIcon from '@material-ui/icons/Settings';

import {
  roomsConfigComplete,
  activitiesConfigComplete,
  anyCompetitorAssignment,
} from '../../../logic/activities';

const menuItems = [
  {
    path: '/roles',
    text: 'Edit roles',
    icon: PermContactCalendarIcon,
    enabled: wcif => true,
  },
  {
    path: '/config',
    text: 'Configure',
    icon: SettingsIcon,
    enabled: wcif => true,
  },
  {
    path: '/groups',
    text: 'Manage groups',
    icon: PeopleIcon,
    enabled: wcif =>
      roomsConfigComplete(wcif) && activitiesConfigComplete(wcif),
  },
  {
    path: '/printing',
    text: 'Print documents',
    icon: PrintIcon,
    enabled: wcif => anyCompetitorAssignment(wcif),
  },
];

const CompetitionMenu = ({ wcif, baseUrl }) => (
  <Paper>
    <List>
      {menuItems.map(menuItem => (
        <ListItem
          key={menuItem.path}
          button
          component={Link}
          to={`${baseUrl}${menuItem.path}`}
          disabled={!menuItem.enabled(wcif)}
        >
          <ListItemIcon>
            <menuItem.icon />
          </ListItemIcon>
          <ListItemText primary={menuItem.text} />
        </ListItem>
      ))}
    </List>
  </Paper>
);

export default CompetitionMenu;
