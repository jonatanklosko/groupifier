import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';

import CompetitionMenu from './CompetitionMenu/CompetitionMenu';
import ConfigManager from './ConfigManager/ConfigManager';
import RolesManager from './RolesManager/RolesManager';

import WcaApi from '../../logic/WcaApi';

export default class Competition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wcif: null,
      loading: true
    }
  }

  componentDidMount() {
    WcaApi.getCompetitionWcif(this.props.match.params.competitionId)
      .then(wcif => this.setState({ wcif, loading: false }))
  }

  handleWcifUpdate(wcif) {
    this.setState({ wcif });
  }

  render() {
    const { wcif, loading } = this.state;
    const { match } = this.props;

    return loading ? <LinearProgress /> : (
      <div>
        <Typography variant="display1" style={{ marginBottom: 16 }}>
          {wcif.name}
        </Typography>
        <Switch>
          <Route exact path={match.url} render={() => <CompetitionMenu baseUrl={match.url} />} />
          <Route path={`${match.url}/roles`} render={
            () => <RolesManager wcif={wcif} onWcifUpdate={this.handleWcifUpdate.bind(this)} />
          } />
          <Route path={`${match.url}/config`} render={
            () => <ConfigManager wcif={wcif} onWcifUpdate={this.handleWcifUpdate.bind(this)} />
          } />
        </Switch>
      </div>
    );
  }
}
