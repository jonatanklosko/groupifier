import React from 'react';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

const features = [
  'Allows for marking competitors as different kinds of staff and handles them in a special manner.',
  'Supports multiple rooms/stages running simultaneously.',
  'Suggests number of groups and necessary roles, while leaving the final decision to the user.',
  'Once configured, creates groups and does its best to optimally assign people to these groups.',
  'Generates documents like scorecards and competitor cards with task assignments.'
];

const Home = () => (
  <Grid container spacing={24} direction="column">
    <Grid item>
      <Typography variant="h4">What is Groupifier?</Typography>
    </Grid>
    <Grid item>
      <Typography variant="subtitle1">
        Task and group management tool for WCA competition organizers.
        It's designed to be highly customizable and work well with complex schedules.
      </Typography>
    </Grid>
    <Grid item>
      <Typography variant="h4">What does it do?</Typography>
    </Grid>
    <Grid item>
      <List>
        {features.map(feature =>
          <ListItem key={feature}>
            <ListItemIcon>
              <Icon>check</Icon>
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        )}
      </List>
    </Grid>
  </Grid>
);

export default Home;
