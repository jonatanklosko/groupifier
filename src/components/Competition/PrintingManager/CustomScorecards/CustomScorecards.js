import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { acceptedPeople } from '../../../../logic/competitors';
import { eventNameById } from '../../../../logic/events';
import { downloadCustomScorecards } from '../../../../logic/documents/scorecards';
import languageInfo from '../../../../logic/translations';

let sectionIdCounter = 0;

const newSection = () => ({
  id: ++sectionIdCounter,
  eventId: '',
  customEventName: '',
  roundNumber: 1,
  groupNumber: 1,
  selectedPersonIds: [],
  manualNames: [],
  search: '',
  manualInput: '',
});

const SectionEditor = ({
  section,
  wcif,
  allPeople,
  onUpdate,
  onRemove,
  onTogglePerson,
  onAddManualName,
  onRemoveManualName,
  showRemove,
}) => {
  const wcifEvent =
    section.eventId && section.eventId !== '_other'
      ? wcif.events.find(e => e.id === section.eventId)
      : null;

  const filteredPeople = section.search
    ? allPeople.filter(p =>
        p.name.toLowerCase().includes(section.search.toLowerCase())
      )
    : allPeople;

  const selectedPeople = section.selectedPersonIds
    .map(id => allPeople.find(p => p.registrantId === id))
    .filter(Boolean);

  const totalSelected =
    section.selectedPersonIds.length + section.manualNames.length;

  const eventSelectValue =
    section.eventId === null ? '_other' : section.eventId;

  const handleEventChange = e => {
    const val = e.target.value;
    if (val === '_other') {
      onUpdate({ eventId: null, roundNumber: 1 });
    } else {
      onUpdate({ eventId: val, roundNumber: 1 });
    }
  };

  return (
    <Paper variant="outlined" style={{ padding: 16, marginBottom: 16 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <FormControl variant="outlined" style={{ minWidth: 220 }}>
            <InputLabel>Event</InputLabel>
            <Select
              value={eventSelectValue}
              onChange={handleEventChange}
              label="Event"
            >
              <MenuItem value="" disabled>
                Select event
              </MenuItem>
              {wcif.events.map(event => (
                <MenuItem key={event.id} value={event.id}>
                  {eventNameById(event.id)}
                </MenuItem>
              ))}
              <MenuItem value="_other">Other (custom)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {section.eventId === null ? (
          <>
            <Grid item>
              <TextField
                label="Event name"
                variant="outlined"
                value={section.customEventName}
                onChange={e => onUpdate({ customEventName: e.target.value })}
                style={{ minWidth: 160 }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Round"
                variant="outlined"
                type="number"
                inputProps={{ min: 1 }}
                value={section.roundNumber}
                onChange={e =>
                  onUpdate({
                    roundNumber: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                style={{ width: 90 }}
              />
            </Grid>
          </>
        ) : wcifEvent ? (
          <Grid item>
            <FormControl variant="outlined">
              <InputLabel>Round</InputLabel>
              <Select
                value={section.roundNumber}
                onChange={e => onUpdate({ roundNumber: e.target.value })}
                label="Round"
                style={{ minWidth: 120 }}
              >
                {wcifEvent.rounds.map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    Round {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : null}

        <Grid item>
          <TextField
            label="Group"
            variant="outlined"
            type="number"
            inputProps={{ min: 1 }}
            value={section.groupNumber}
            onChange={e =>
              onUpdate({
                groupNumber: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            style={{ width: 90 }}
          />
        </Grid>

        {showRemove && (
          <Grid item style={{ marginLeft: 'auto' }}>
            <IconButton onClick={onRemove} size="small">
              <DeleteIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>

      <Divider style={{ margin: '12px 0' }} />

      <Grid container spacing={2}>
        <Grid item xs={7}>
          <Typography variant="subtitle2" gutterBottom>
            Select competitors
          </Typography>
          <TextField
            label="Search by name"
            value={section.search}
            onChange={e => onUpdate({ search: e.target.value })}
            fullWidth
            size="small"
            variant="outlined"
            style={{ marginBottom: 8 }}
          />
          <List
            dense
            style={{
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
          >
            {filteredPeople.map(person => (
              <ListItem
                key={person.registrantId}
                button
                dense
                onClick={() => onTogglePerson(person.registrantId)}
              >
                <ListItemText primary={person.name} />
                <Checkbox
                  checked={section.selectedPersonIds.includes(
                    person.registrantId
                  )}
                  size="small"
                  style={{ padding: 4 }}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItem>
            ))}
            {filteredPeople.length === 0 && (
              <ListItem>
                <ListItemText secondary="No competitors found" />
              </ListItem>
            )}
          </List>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle2" gutterBottom>
            Selected ({totalSelected})
          </Typography>
          <div style={{ marginBottom: 8 }}>
            {selectedPeople.map(person => (
              <Chip
                key={person.registrantId}
                label={person.name}
                size="small"
                onDelete={() => onTogglePerson(person.registrantId)}
                style={{ margin: '2px' }}
              />
            ))}
            {section.manualNames.map(name => (
              <Chip
                key={name}
                label={name}
                size="small"
                variant="outlined"
                onDelete={() => onRemoveManualName(name)}
                style={{ margin: '2px' }}
              />
            ))}
            {totalSelected === 0 && (
              <Typography variant="caption" color="textSecondary">
                No competitors selected
              </Typography>
            )}
          </div>

          <Typography variant="subtitle2" gutterBottom>
            Add manually
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs>
              <TextField
                label="Name"
                value={section.manualInput}
                onChange={e => onUpdate({ manualInput: e.target.value })}
                onKeyPress={e => {
                  if (e.key === 'Enter') onAddManualName();
                }}
                size="small"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item>
              <Button
                size="small"
                onClick={onAddManualName}
                disabled={!section.manualInput.trim()}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const CustomScorecards = ({ wcif }) => {
  const [sections, setSections] = useState([newSection()]);
  const [language, setLanguage] = useState('en');

  const allPeople = acceptedPeople(wcif);

  const addSection = () => {
    setSections(prev => [...prev, newSection()]);
  };

  const removeSection = id => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSection = (id, changes) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, ...changes } : s))
    );
  };

  const togglePerson = (sectionId, personId) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        const ids = s.selectedPersonIds;
        return {
          ...s,
          selectedPersonIds: ids.includes(personId)
            ? ids.filter(id => id !== personId)
            : [...ids, personId],
        };
      })
    );
  };

  const addManualName = sectionId => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        const name = s.manualInput.trim();
        if (!name || s.manualNames.includes(name))
          return { ...s, manualInput: '' };
        return {
          ...s,
          manualNames: [...s.manualNames, name],
          manualInput: '',
        };
      })
    );
  };

  const removeManualName = (sectionId, name) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, manualNames: s.manualNames.filter(n => n !== name) }
          : s
      )
    );
  };

  const hasAnyCompetitors = sections.some(
    s => s.selectedPersonIds.length > 0 || s.manualNames.length > 0
  );

  const handleDownload = () => {
    const pdfSections = sections
      .map(section => {
        const competitors = [
          ...section.selectedPersonIds
            .map(id => allPeople.find(p => p.registrantId === id))
            .filter(Boolean)
            .map(p => ({
              name: p.name,
              registrantId: p.registrantId,
              wcaId: p.wcaId,
            })),
          ...section.manualNames.map(name => ({
            name,
            registrantId: null,
            wcaId: null,
          })),
        ];
        return {
          eventId: section.eventId || null,
          customEventName: section.customEventName,
          roundNumber: section.roundNumber,
          groupNumber: section.groupNumber,
          competitors,
        };
      })
      .filter(s => s.competitors.length > 0);

    if (pdfSections.length > 0) {
      downloadCustomScorecards(wcif, pdfSections, language);
    }
  };

  return (
    <>
      {sections.map(section => (
        <SectionEditor
          key={section.id}
          section={section}
          wcif={wcif}
          allPeople={allPeople}
          onUpdate={changes => updateSection(section.id, changes)}
          onRemove={() => removeSection(section.id)}
          onTogglePerson={personId => togglePerson(section.id, personId)}
          onAddManualName={() => addManualName(section.id)}
          onRemoveManualName={name => removeManualName(section.id, name)}
          showRemove={sections.length > 1}
        />
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addSection}
        style={{ marginBottom: 16 }}
      >
        Add event
      </Button>

      <Grid container spacing={2} alignItems="center">
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
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            disabled={!hasAnyCompetitors}
          >
            Download scorecards
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default CustomScorecards;
