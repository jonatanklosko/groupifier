import React, { Component } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { eventNameById } from '../../../logic/events';

export default class EventSelect extends Component {
  render() {
    const { selected, events } = this.props;

    return (
      <div>
        {events.map(event => (
          <Tooltip key={event.id} title={eventNameById(event.id)} placement="top">
            <IconButton onClick={() => this.props.onChange(event.id)}>
              <span
                className={`cubing-icon event-${event.id}`}
                style={{ opacity: event.id === selected ? 1 : 0.3 }}
              />
            </IconButton>
          </Tooltip>
        ))}
      </div>
    );
  }
}
