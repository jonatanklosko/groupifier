import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

import RoomConfig from '../RoomConfig/RoomConfig';
import { updateIn } from '../../../../logic/helpers';
import { getGroupifierData } from '../../../../logic/wcifExtensions';

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
    const disabled = wcif.schedule.venues[0].rooms.some(room =>
      room.activities.some(getGroupifierData)
    );

    return (
      <Paper style={{ padding: 16 }}>
        <Grid container spacing={16}>
          {wcif.schedule.venues[0].rooms.map(room =>
            <Grid item xs key={room.id}>
              <RoomConfig room={room} onChange={this.handleRoomChange} disabled={disabled} />
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  }
}
