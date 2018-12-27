import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import RoomConfig from '../RoomConfig/RoomConfig';
import { mapIn } from '../../../../logic/utils';
import { anyActivityConfigured, rooms } from '../../../../logic/activities';

export default class RoomsConfig extends Component {
  handleRoomChange = updatedRoom => {
    const { wcif, onWcifChange } = this.props;
    onWcifChange(
      mapIn(wcif, ['schedule', 'venues'], venue =>
        mapIn(venue, ['rooms'], room =>
          room.id === updatedRoom.id ? updatedRoom : room
        )
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
          {rooms(wcif).map(room =>
            <Grid item lg key={room.id}>
              <RoomConfig room={room} onChange={this.handleRoomChange} disabled={disabled} />
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  }
}
