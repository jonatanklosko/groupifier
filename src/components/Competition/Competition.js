import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

import CompetitionMenu from './CompetitionMenu/CompetitionMenu';
import ConfigManager from './ConfigManager/ConfigManager';
import GroupsManager from './GroupsManager/GroupsManager';
import PrintingManager from './PrintingManager/PrintingManager';
import RolesManager from './RolesManager/RolesManager';

import { getCompetitionWcif } from '../../logic/wca-api';

export default class Competition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wcif: null,
      loading: true
    }
  }

  componentDidMount() {
    getCompetitionWcif(this.props.match.params.competitionId)
      .then(wcif => this.setState({ wcif, loading: false }))
  }

  handleWcifUpdate = wcif => {
    this.setState({ wcif });
  };

  render() {
    const { wcif, loading } = this.state;
    const { match } = this.props;

    return loading ? <LinearProgress /> : (
      <div>
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
      </div>
    );
  }
}
