import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Draggable } from 'react-beautiful-dnd';

import { best } from '../../../../../logic/competitors';
import { centisecondsToClockFormat } from '../../../../../logic/formatters';

const DraggableCompetitor = React.memo(
  ({ person, draggableId, index, averageLabelEventId = null, ...props }) => {
    const average =
      averageLabelEventId && best(person, averageLabelEventId, 'average');
    const averageDescription =
      average < Infinity ? ` (${centisecondsToClockFormat(average)})` : '';

    return (
      <Draggable draggableId={draggableId} index={index}>
        {provided => (
          <ListItem
            {...props}
            button
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <ListItemText primary={person.name + averageDescription} />
          </ListItem>
        )}
      </Draggable>
    );
  }
);

export default DraggableCompetitor;
