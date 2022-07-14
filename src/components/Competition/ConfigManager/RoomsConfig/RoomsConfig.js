import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import RoomConfig from '../RoomConfig/RoomConfig';
import { mapIn } from '../../../../logic/utils';
import { anyActivityConfigInRoom, rooms } from '../../../../logic/activities';

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

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container spacing={2}>
        {rooms(wcif).map(room => (
          <Grid item key={room.id}>
            {/* Disable rooms configuration once activities config has been populated. */}
            <RoomConfig
              room={room}
              onChange={handleRoomChange}
              disabled={anyActivityConfigInRoom(room)}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RoomsConfig;
