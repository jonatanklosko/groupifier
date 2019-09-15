import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  roomDot: {
    display: 'inline-block',
    width: 10,
    height: 10,
    marginRight: 5,
    borderRadius: '100%',
  },
}));

const RoomName = ({ room }) => {
  const classes = useStyles();
  return (
    <Typography variant="subtitle2">
      <span
        className={classes.roomDot}
        style={{ backgroundColor: room.color }}
      />
      <span>{room.name}</span>
    </Typography>
  );
};

export default RoomName;
