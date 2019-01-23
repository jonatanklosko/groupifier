import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import CompetitionMenu from './CompetitionMenu/CompetitionMenu';
import ConfigManager from './ConfigManager/ConfigManager';
import GroupsManager from './GroupsManager/GroupsManager';
import PrintingManager from './PrintingManager/PrintingManager';
import RolesManager from './RolesManager/RolesManager';

import { getWcif } from '../../logic/wca-api';
import { sortWcifEvents } from '../../logic/events';
import { updateIn } from '../../logic/utils';
import { validateWcif } from '../../logic/wcif-validation';
import { acceptedPeople } from '../../logic/competitors';

export default class Competition extends Component {
  state = {
    wcif: null,
    loading: true,
    errors: []
  };

  componentDidMount() {
    getWcif(this.props.match.params.competitionId)
      .then(wcif => updateIn(wcif, ['events'], sortWcifEvents)) /* Sort events, so that we don't need to remember about this everywhere. */
      .then(wcif => {
        /* FIXME: dirty hack for registrantId to match Cubecomps competitor id. Get rid of that once WCA Live is ready. */
        acceptedPeople(wcif).forEach((person, index) => person.registrantId = index + 1);
        return wcif;
      })
      .then(wcif => this.setState({ wcif, loading: false, errors: validateWcif(wcif) }))
      .catch(error => this.setState({ errors: [error.message], loading: false }))
  }

  handleWcifUpdate = wcif => {
    this.setState({ wcif });
  };

  render() {
    const { wcif, loading, errors } = this.state;
    const { match } = this.props;

    return loading ? <LinearProgress /> : (
      <div>
        {errors.length === 0 ? (
          <Fragment>
            <Typography variant="h5" style={{ marginBottom: 16 }}>
              {wcif.name}
            </Typography>
            <Switch>
              <Route exact path={match.url} render={
                props => <CompetitionMenu {...props} wcif={wcif} baseUrl={match.url} />
              } />
              <Route path={`${match.url}/roles`} render={
                props => <RolesManager {...props} wcif={wcif} onWcifUpdate={this.handleWcifUpdate} />
              } />
              <Route path={`${match.url}/config`} render={
                props => <ConfigManager {...props} wcif={wcif} onWcifUpdate={this.handleWcifUpdate} />
              } />
              <Route path={`${match.url}/groups`} render={
                props => <GroupsManager {...props} wcif={wcif} onWcifUpdate={this.handleWcifUpdate} />
              } />
              <Route path={`${match.url}/printing`} render={
                props => <PrintingManager {...props} wcif={wcif} />
              } />
            </Switch>
          </Fragment>
        ) : (
          <Fragment>
            <Typography variant="h5">Failed to load competition data</Typography>
            <List>
              {errors.map(error => (
                <ListItem key={error}>
                  <ListItemText>{error}</ListItemText>
                </ListItem>
              ))}
            </List>
          </Fragment>
        )}
      </div>
    );
  }
}
