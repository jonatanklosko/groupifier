import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import CubingIcon from '../CubingIcon/CubingIcon';
import { eventNameById } from '../../../logic/events';

const EventSelect = ({ events, selected, onChange }) => {
  return (
    <div>
      {events.map(event => (
        <Tooltip key={event.id} title={eventNameById(event.id)} placement="top">
          <IconButton onClick={() => onChange(event.id)}>
            <CubingIcon
              eventId={event.id}
              style={{ opacity: event.id === selected ? 1 : 0.3 }}
            />
          </IconButton>
        </Tooltip>
      ))}
    </div>
  );
};

export default EventSelect;
