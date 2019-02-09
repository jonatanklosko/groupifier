import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';

import { getUpcomingManageableCompetitions } from '../../logic/wca-api';
import { sortBy } from '../../logic/utils';

export default class CompetitionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitions: [],
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    getUpcomingManageableCompetitions()
      .then(competitions =>
        this.setState({
          competitions: sortBy(competitions, competition => competition['start_date']),
          loading: false
        })
      )
      .catch(error => this.setState({ error: error.message, loading: false }));
  }

  render() {
    const { competitions, loading, error } = this.state;

    return (
      <div>
        <Paper>
          <List subheader={<ListSubheader>Your competitions</ListSubheader>}>
            {error &&
              <ListItem>
                <ListItemIcon>
                  <Icon>error</Icon>
                </ListItemIcon>
                <ListItemText primary={`Couldn't fetch competitions: ${error}`} />
              </ListItem>
            }
            {!loading && !error && competitions.length === 0 &&
              <ListItem>
                <ListItemIcon>
                  <Icon>sentiment_very_dissatisfied</Icon>
                </ListItemIcon>
                <ListItemText primary="You have no upcoming competitions to manage." />
              </ListItem>
            }
            {competitions.map(competition =>
              <ListItem key={competition.id} button component={Link} to={`/competitions/${competition.id}`}>
                <ListItemText primary={competition.name} />
              </ListItem>
            )}
          </List>
          {loading && <LinearProgress />}
        </Paper>
      </div>
    );
  }
}
