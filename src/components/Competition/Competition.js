import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';

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

    return (
      <div>
        {loading && <LinearProgress />}
        <Typography variant="display1">
          {wcif && wcif.name}
        </Typography>
        {wcif && <Switch>
          <Route path="/competitions/:competitionId/roles" render={
            () => <RolesManager wcif={wcif} onWcifUpdate={this.handleWcifUpdate.bind(this)} />
          } />
        </Switch>}
      </div>
    );
  }
}
