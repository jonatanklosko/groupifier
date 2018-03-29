import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { LinearProgress } from 'material-ui/Progress';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import ListSubheader from 'material-ui/List/ListSubheader';
import Paper from 'material-ui/Paper';
import Icon from 'material-ui/Icon';

import WcaApi from '../../logic/WcaApi';

export default class CompetitionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitions: [],
      loading: true
    }
  }

  componentDidMount() {
    WcaApi.getUpcomingManageableCompetitions()
      .then(competitions => this.setState({ competitions, loading: false }));
  }

  render() {
    const { competitions, loading } = this.state;

    return (
      <div>
        <Paper>
          <List subheader={<ListSubheader>Your competitions</ListSubheader>}>
            {!loading && competitions.length === 0 &&
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
