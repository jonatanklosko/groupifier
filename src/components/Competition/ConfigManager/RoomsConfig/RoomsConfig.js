import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import RoomConfig from '../RoomConfig/RoomConfig';
import { updateIn } from '../../../../logic/utils';
import { anyActivityConfigured } from '../../../../logic/activities';

export default class RoomsConfig extends Component {
  handleRoomChange = updatedRoom => {
    const { wcif, onWcifChange } = this.props;
    onWcifChange(
      updateIn(wcif, ['schedule', 'venues', '0', 'rooms'], rooms =>
        rooms.map(room => room.id === updatedRoom.id ? updatedRoom : room)
      )
    );
  };

  render() {
    const { wcif } = this.props;
    /* Disable rooms configuration once activities config has been populated. */
    const disabled = anyActivityConfigured(wcif);

    return (
      <Paper style={{ padding: 16 }}>
        <Grid container spacing={16}>
          {wcif.schedule.venues[0].rooms.map(room =>
            <Grid item lg key={room.id}>
              <RoomConfig room={room} onChange={this.handleRoomChange} disabled={disabled} />
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  }
}
