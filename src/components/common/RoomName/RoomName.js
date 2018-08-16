import React from 'react';
import Typography from '@material-ui/core/Typography';

const RoomName = ({ room }) => (
  <Typography variant="body2">
    <span style={{
        display: 'inline-block',
        width: 10, height: 10, marginRight: 5,
        borderRadius: '100%', backgroundColor: room.color
      }}
    />
    <span>{room.name}</span>
  </Typography>
);

export default RoomName;
