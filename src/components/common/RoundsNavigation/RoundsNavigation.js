import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';

import EventSelect from '../../common/EventSelect/EventSelect';
import RoundPanel from './RoundPanel/RoundPanel';

const RoundsNavigation = ({ events, render }) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0].id);
  const [expandedRoundId, setExpandedRoundId] = useState(null);

  const selectedEvent = events.find(event => event.id === selectedEventId);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <EventSelect
          selected={selectedEventId}
          events={events}
          onChange={setSelectedEventId}
        />
      </Grid>
      <Grid item xs={12}>
        {selectedEvent.rounds.map(round => (
          <RoundPanel
            key={round.id}
            expanded={round.id === expandedRoundId}
            roundId={round.id}
            render={render}
            onChange={setExpandedRoundId}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default RoundsNavigation;
