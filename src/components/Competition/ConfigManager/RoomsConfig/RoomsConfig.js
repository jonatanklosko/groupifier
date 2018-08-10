import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

import RoomConfig from '../RoomConfig/RoomConfig';
import { updateIn } from '../../../../logic/helpers';

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

    return (
      <Paper style={{ padding: 16 }}>
        <Grid container spacing={16}>
          {wcif.schedule.venues[0].rooms.map(room =>
            <Grid item xs key={room.id}>
              <RoomConfig room={room} onChange={this.handleRoomChange} />
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  }
}
