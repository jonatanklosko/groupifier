import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import { downloadEmptyScorecardsForPersons } from '../../../../logic/documents/scorecards';
import {
  activityCodeToName,
  competitorsRegisteredForAnEventWithoutGroups,
} from '../../../../logic/activities';
import languageInfo from '../../../../logic/translations';
import { Avatar, ListItemAvatar } from '@material-ui/core';

const OTSScorecards = ({ wcif }) => {
  const missingScorecards = competitorsRegisteredForAnEventWithoutGroups(wcif);
  const [selectedCompetitors, setSelectedCompetitors] = useState(
    missingScorecards.map(c => c.person.wcaUserId)
  );

  const handleCompetitorClick = competitor => {
    const id = competitor.person.wcaUserId;
    setSelectedCompetitors(
      selectedCompetitors.includes(id)
        ? selectedCompetitors.filter(c => c !== id)
        : [...selectedCompetitors, id]
    );
  };

  const competitorSelected = competitor =>
    selectedCompetitors.includes(competitor.person.wcaUserId);

  const isSelectionEmpty = selectedCompetitors.length === 0;

  const [language, setLanguage] = useState('en');

  return (
    <Paper style={{ padding: 16 }}>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Select competitors</Typography>
          <List style={{ width: 400 }}>
            {missingScorecards.map(scorecards => (
              <ListItem
                key={scorecards.person.wcaUserId}
                button
                onClick={() => handleCompetitorClick(scorecards)}
                style={
                  missingScorecards.includes(scorecards) ? {} : { opacity: 0.5 }
                }
              >
                <ListItemAvatar>
                  <Avatar
                    alt={scorecards.person.name}
                    src={scorecards.person.avatar?.thumbUrl}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={scorecards.person.name}
                  secondary={scorecards.eventIds
                    .map(eventId => activityCodeToName(`${eventId}-r1`))
                    .join(', ')}
                />
                <Checkbox
                  checked={competitorSelected(scorecards)}
                  tabIndex={-1}
                  disableRipple
                  style={{ padding: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: 16, marginBottom: 16 }}>
        <Grid item xs={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Scorecards language</InputLabel>
            <Select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              label="Scorecards language"
            >
              {languageInfo.map(({ code, originalName, englishName }) => (
                <MenuItem key={code} value={code}>
                  {originalName === englishName
                    ? originalName
                    : `${originalName} (${englishName})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item>
          <Button
            onClick={() =>
              downloadEmptyScorecardsForPersons(
                wcif,
                selectedCompetitors,
                language
              )
            }
            disabled={isSelectionEmpty}
          >
            Scorecards
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OTSScorecards;
