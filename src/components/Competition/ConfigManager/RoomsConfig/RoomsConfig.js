import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import RoomConfig from '../RoomConfig/RoomConfig';
import { mapIn } from '../../../../logic/utils';
import { anyActivityConfig, rooms } from '../../../../logic/activities';

const RoomsConfig = ({ wcif, onWcifChange }) => {
  const handleRoomChange = updatedRoom => {
    onWcifChange(
      mapIn(wcif, ['schedule', 'venues'], venue =>
        mapIn(venue, ['rooms'], room =>
          room.id === updatedRoom.id ? updatedRoom : room
        )
      )
    );
  };

  /* Disable rooms configuration once activities config has been populated. */
  const disabled = anyActivityConfig(wcif);

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container spacing={2}>
        {rooms(wcif).map(room => (
          <Grid item key={room.id}>
            <RoomConfig
              room={room}
              onChange={handleRoomChange}
              disabled={disabled}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RoomsConfig;
