import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import CubingIcon from '../../../common/CubingIcon/CubingIcon';
import {
  downloadScorecards,
  downloadBlankScorecards,
} from '../../../../logic/documents/scorecards';
import { downloadGroupOverview } from '../../../../logic/documents/group-overview';
import {
  roundsWithoutResults,
  roundsMissingScorecards,
  parseActivityCode,
  activityCodeToName,
  rooms,
} from '../../../../logic/activities';
import { difference, sortBy } from '../../../../logic/utils';

const Scorecards = ({ wcif }) => {
  const missingScorecards = roundsMissingScorecards(wcif);
  const [selectedRounds, setSelectedRounds] = useState(
    missingScorecards.every(
      round => parseActivityCode(round.id).roundNumber === 1
    )
      ? missingScorecards
      : []
  );
  const rounds = sortBy(
    roundsWithoutResults(wcif).filter(
      round => parseActivityCode(round.id).eventId !== '333fm'
    ),
    round => parseActivityCode(round.id).roundNumber
  );

  const handleRoundClick = round => {
    setSelectedRounds(
      selectedRounds.includes(round)
        ? difference(selectedRounds, [round])
        : [...selectedRounds, round]
    );
  };

  const allRooms = rooms(wcif);

  const [selectedRooms, setSelectedRooms] = useState(allRooms);

  const handleRoomClick = room => {
    setSelectedRooms(
      selectedRooms.includes(room)
        ? difference(selectedRooms, [room])
        : [...selectedRooms, room]
    );
  };

  const isSelectionEmpty =
    selectedRounds.length === 0 || selectedRooms.length === 0;

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Select rounds</Typography>
          <List style={{ width: 400 }}>
            {rounds.map(round => (
              <ListItem
                key={round.id}
                button
                onClick={() => handleRoundClick(round)}
                style={
                  missingScorecards.includes(round) ? {} : { opacity: 0.5 }
                }
              >
                <ListItemIcon>
                  <CubingIcon eventId={parseActivityCode(round.id).eventId} />
                </ListItemIcon>
                <ListItemText primary={activityCodeToName(round.id)} />
                <Checkbox
                  checked={selectedRounds.includes(round)}
                  tabIndex={-1}
                  disableRipple
                  style={{ padding: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        {allRooms.length > 1 && (
          <Grid item xs={6}>
            <Typography variant="subtitle1">Select rooms</Typography>
            <List style={{ width: 400 }}>
              {allRooms.map(room => (
                <ListItem
                  key={room.id}
                  button
                  onClick={() => handleRoomClick(room)}
                  style={selectedRooms.includes(room) ? {} : { opacity: 0.5 }}
                >
                  <ListItemText primary={room.name} />
                  <Checkbox
                    checked={selectedRooms.includes(room)}
                    tabIndex={-1}
                    disableRipple
                    style={{ padding: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={1}>
        <Grid item>
          <Button
            onClick={() =>
              downloadScorecards(wcif, selectedRounds, selectedRooms)
            }
            disabled={isSelectionEmpty}
          >
            Scorecards
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() =>
              downloadGroupOverview(wcif, selectedRounds, selectedRooms)
            }
            disabled={isSelectionEmpty}
          >
            Group overview
          </Button>
        </Grid>
        <Grid item style={{ flexGrow: 1 }} />
        <Grid item>
          <Button onClick={() => downloadBlankScorecards(wcif)}>
            Blank scorecards
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Scorecards;
