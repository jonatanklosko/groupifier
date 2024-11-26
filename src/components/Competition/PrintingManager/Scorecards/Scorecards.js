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
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';

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
import language_info from '../../../../logic/translations';

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

  const [language, setLanguage] = useState('en');
  const [language2, setLanguage2] = useState('');
  const [language3, setLanguage3] = useState('');

  const LanguageSelector = ({
    language,
    setLanguage,
    label,
    includeNoneOption = false,
    withSubheader = false,
    tip = false,
    excludeLanguages = [],
  }) => {
    // do not show a language if it has already been selected in another select
    const filteredLanguages = Object.entries(language_info).filter(
      ([key]) => !excludeLanguages.includes(key)
    );

    return (
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            label={label}
          >
            {includeNoneOption && <MenuItem value="">None</MenuItem>}
            {filteredLanguages.map(([key, { original_name, english_name }]) => (
              <MenuItem key={key} value={key}>
                {original_name === english_name
                  ? original_name
                  : `${original_name} (${english_name})`}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{tip}</FormHelperText>
        </FormControl>
      </Grid>
    );
  };

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
      <Grid container spacing={2} style={{ marginTop: 16, marginBottom: 16 }}>
        <Grid item xs={4}>
          <LanguageSelector
            language={language}
            setLanguage={setLanguage}
            label="Scorecards language"
            tip="Scorecards main language"
          />
        </Grid>
        <Grid item xs={4}>
          <LanguageSelector
            language={language2}
            setLanguage={setLanguage2}
            label="Second scorecards language"
            includeNoneOption
            tip="For bilingual scorecards (optional)"
            excludeLanguages={[language, language3]}
          />
        </Grid>
        {wcif.extensions[0].data.scorecardPaperSize !== 'letter' && (
          <Grid item xs={4}>
            <LanguageSelector
              language={language3}
              setLanguage={setLanguage3}
              label="Third scorecards language"
              includeNoneOption
              tip="For trilingual scorecards (optional)"
              excludeLanguages={[language, language2]}
            />
          </Grid>
        )}
      </Grid>
      <Grid container spacing={1}>
        <Grid item>
          <Button
            onClick={() =>
              downloadScorecards(
                wcif,
                selectedRounds,
                selectedRooms,
                language,
                language2,
                language3
              )
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
          <Button
            onClick={() =>
              downloadBlankScorecards(wcif, language, language2, language3)
            }
          >
            Blank scorecards
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Scorecards;
