import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import EventSelect from '../../common/EventSelect/EventSelect';
import RoundPanel from './RoundPanel/RoundPanel';

export default class RoundsNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEventId: props.events[0].id,
      expandedRoundId: null
    };
  }

  handleEventChange = eventId => {
    this.setState({ selectedEventId: eventId });
  };

  handleRoundChange = roundId => {
    this.setState({ expandedRoundId: roundId });
  };

  render() {
    const { selectedEventId, expandedRoundId } = this.state;
    const { events, render } = this.props;
    const selectedEvent = events.find(event => event.id === selectedEventId);

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <EventSelect selected={selectedEventId} events={events} onChange={this.handleEventChange} />
        </Grid>
        <Grid item xs={12}>
          {selectedEvent.rounds.map(round => (
            <RoundPanel
              key={round.id}
              expanded={round.id === expandedRoundId}
              roundId={round.id}
              render={render}
              onChange={this.handleRoundChange}
            />
          ))}
        </Grid>
      </Grid>
    );
  }
}
