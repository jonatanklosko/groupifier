import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import CubingIcon from '../../../../common/CubingIcon/CubingIcon';
import { eventNameById } from '../../../../../logic/events';
import {
  acceptedPeople,
  bestAverageAndSingle,
} from '../../../../../logic/competitors';
import { centisecondsToClockFormat } from '../../../../../logic/formatters';
import { sortByArray } from '../../../../../logic/utils';

/* Scramble checker boxes are never printed for these events. */
const eventsWithoutScrambleChecker = ['555', '666', '777', 'minx'];

const formatPersonalBest = (eventId, type, value) => {
  if (eventId === '333fm') {
    return type === 'average' ? (value / 100).toFixed(2) : `${value}`;
  }
  if (eventId === '333mbf') {
    const missed = value % 100;
    const seconds = Math.floor(value / 100) % 100000;
    const solved = 99 - (Math.floor(value / 10000000) % 100) + missed;
    return `${solved}/${solved + missed} ${centisecondsToClockFormat(
      seconds * 100
    )}`;
  }
  return centisecondsToClockFormat(value);
};

const personalBestsDescription = (person, eventId) => {
  const parts = ['single', 'average']
    .map(type => {
      const personalBest = (person.personalBests || []).find(
        pb => pb.eventId === eventId && pb.type === type
      );
      if (!personalBest) return null;
      const rankings = [
        ['NR', personalBest.nationalRanking],
        ['CR', personalBest.continentalRanking],
        ['WR', personalBest.worldRanking],
      ]
        .filter(([, ranking]) => ranking > 0)
        .map(([name, ranking]) => `${name} ${ranking}`)
        .join(', ');
      const label = type === 'single' ? 'Single' : 'Average';
      const result = formatPersonalBest(eventId, type, personalBest.value);
      return rankings
        ? `${label} ${result} – ${rankings}`
        : `${label} ${result}`;
    })
    .filter(Boolean);
  return parts.length > 0 ? `(${parts.join(' · ')})` : '(no results)';
};

const ScrambleCheckerCompetitorsDialog = ({
  open,
  wcif,
  selectedCompetitors,
  onChange,
  onClose,
}) => {
  const [eventId, setEventId] = useState(null);

  const events = wcif.events.filter(
    event => !eventsWithoutScrambleChecker.includes(event.id)
  );

  const selectedForEvent = id => selectedCompetitors[id] || [];

  const competitorsForEvent = id =>
    sortByArray(
      acceptedPeople(wcif).filter(({ registration }) =>
        registration.eventIds.includes(id)
      ),
      person => [...bestAverageAndSingle(person, id), person.name]
    );

  const handleToggle = registrantId => {
    const selected = selectedForEvent(eventId);
    const updated = selected.includes(registrantId)
      ? selected.filter(id => id !== registrantId)
      : [...selected, registrantId];
    onChange({ ...selectedCompetitors, [eventId]: updated });
  };

  const handleClose = () => {
    setEventId(null);
    onClose();
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <AppBar position="static">
        <Toolbar>
          {eventId && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setEventId(null)}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {eventId
              ? `Scramble checker - ${eventNameById(eventId)}`
              : 'Scramble checker - select event'}
          </Typography>
          <Button color="inherit" onClick={handleClose}>
            Done
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        {!eventId ? (
          <List>
            {events.map(event => (
              <ListItem
                button
                key={event.id}
                onClick={() => setEventId(event.id)}
              >
                <ListItemIcon>
                  <CubingIcon eventId={event.id} />
                </ListItemIcon>
                <ListItemText
                  primary={eventNameById(event.id)}
                  secondary={`${selectedForEvent(event.id).length} selected`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <List>
            {competitorsForEvent(eventId).map(person => (
              <ListItem
                button
                key={person.registrantId}
                onClick={() => handleToggle(person.registrantId)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedForEvent(eventId).includes(
                      person.registrantId
                    )}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={person.name}
                  secondary={`${person.wcaId ||
                    'Newcomer'} ${personalBestsDescription(person, eventId)}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScrambleCheckerCompetitorsDialog;
