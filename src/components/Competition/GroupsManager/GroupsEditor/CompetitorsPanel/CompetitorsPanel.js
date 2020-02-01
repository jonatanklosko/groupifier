import React, { useState, Fragment } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/styles';
import { Droppable } from 'react-beautiful-dnd';

import AllDraggableCompetitors from '../AllDraggableCompetitors/AllDraggableCompetitors';

export const COMPETITORS_PANEL_DROPPABLE_ID = 'competitors';

const useStyles = makeStyles(theme => ({
  list: {
    backgroundColor: theme.palette.background.paper,
  },
}));

const CompetitorsPanel = React.memo(({ wcif, roundId }) => {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  return (
    <Fragment>
      <Box p={1}>
        <TextField
          fullWidth
          label="Search"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </Box>
      <Droppable droppableId={COMPETITORS_PANEL_DROPPABLE_ID}>
        {provided => (
          <List
            ref={provided.innerRef}
            {...provided.droppableProps}
            dense
            className={classes.list}
          >
            <AllDraggableCompetitors
              wcif={wcif}
              roundId={roundId}
              search={search}
            />
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </Fragment>
  );
});

export default CompetitorsPanel;
