import React, { useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Draggable } from 'react-beautiful-dnd';

import { best } from '../../../../../logic/competitors';
import { centisecondsToClockFormat } from '../../../../../logic/formatters';
import PersonInfoDialog from '../PersonInfoDialog/PersonInfoDialog';

const DraggableCompetitor = React.memo(
  ({ person, draggableId, index, averageLabelEventId = null, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const average =
      averageLabelEventId && best(person, averageLabelEventId, 'average');
    const averageDescription =
      average < Infinity ? ` (${centisecondsToClockFormat(average)})` : '';

    return (
      <>
        <Draggable draggableId={draggableId} index={index}>
          {provided => (
            <ListItem
              {...props}
              button
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={() => setIsOpen(!isOpen)}
            >
              <ListItemText primary={person.name + averageDescription} />
            </ListItem>
          )}
        </Draggable>
        {isOpen && (
          <PersonInfoDialog person={person} onClose={() => setIsOpen(false)} />
        )}
      </>
    );
  }
);

export default DraggableCompetitor;
