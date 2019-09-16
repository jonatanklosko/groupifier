import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import ErrorIcon from '@material-ui/icons/Error';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';

import { getUpcomingManageableCompetitions } from '../../logic/wca-api';
import { sortBy } from '../../logic/utils';

const CompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUpcomingManageableCompetitions()
      .then(competitions => {
        setCompetitions(
          sortBy(competitions, competition => competition['start_date'])
        );
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Paper>
      <List subheader={<ListSubheader>Your competitions</ListSubheader>}>
        {error && (
          <ListItem>
            <ListItemIcon>
              <ErrorIcon />
            </ListItemIcon>
            <ListItemText primary={`Couldn't fetch competitions: ${error}`} />
          </ListItem>
        )}
        {!loading && !error && competitions.length === 0 && (
          <ListItem>
            <ListItemIcon>
              <SentimentVeryDissatisfiedIcon />
            </ListItemIcon>
            <ListItemText primary="You have no upcoming competitions to manage." />
          </ListItem>
        )}
        {competitions.map(competition => (
          <ListItem
            key={competition.id}
            button
            component={Link}
            to={`/competitions/${competition.id}`}
          >
            <ListItemText primary={competition.name} />
          </ListItem>
        ))}
      </List>
      {loading && <LinearProgress />}
    </Paper>
  );
};

export default CompetitionList;
