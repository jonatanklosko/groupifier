import React, { Component } from 'react';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';

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

  render() {
    const { wcif, loading } = this.state;

    return (
      <div>
        {loading && <LinearProgress />}
        <Typography variant="display1">
          {wcif && wcif.name}
        </Typography>
      </div>
    );
  }
}
