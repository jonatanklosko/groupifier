import React, { Component } from 'react';

import WcaApi from '../../logic/WcaApi';

export default class Competition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wcif: null
    }
  }

  componentDidMount() {
    WcaApi.getCompetitionWcif(this.props.match.params.competitionId)
      .then(wcif => this.setState({ wcif }))
  }

  render() {
    return (
      <div>{this.state.wcif && this.state.wcif.name}</div>
    );
  }
}
