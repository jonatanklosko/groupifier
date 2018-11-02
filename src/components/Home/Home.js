import React from 'react';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

const features = [
  'Automatically calculates a suitable group size.',
  'Assigns tasks to people (scrambling, judging). Allows to select scramblers manually from a list.',
  'Sorts competitors by their official results, so that each subsequent group represents a better level. When told otherwise, minimizes the amount of people with the same name in each group.',
  'Handles events being held simultaneous by creating separate groups for people taking part in both main and side event.',
  'Generates PDFs containing scorecards, personal cards with task assignment and a summary for each round.',
  'Fetches cutoffs and time limits from the WCA website and puts them on scorecards.',
  'Optionally sets the number of scramble groups for each round based on advancement conditions and saves that to the WCA website, so there is no need for entering them manually.'
];

const Home = () => (
  <Grid container spacing={24} direction="column">
    <Grid item>
      <Typography variant="h4">What is Groupifier?</Typography>
    </Grid>
    <Grid item>
      <Typography variant="subtitle1">
        It is a tool meant for WCA competition organizers.
        Its main objective is to simplify the process of splitting competitors into groups
        and provide the best result with minimal configuration.
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
