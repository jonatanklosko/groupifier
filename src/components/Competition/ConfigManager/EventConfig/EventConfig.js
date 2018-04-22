import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

const PositiveIntegerInput = ({ value, onChange, ...props }) => {
  const handleTextFieldChange = event => {
    const newValue = event.target.value.length > 0 ? parseInt(event.target.value, 10) : null;
    if (newValue === null || (!Number.isNaN(newValue) && newValue >= 1)) {
      onChange(newValue);
    }
  };

  return (
    <TextField {...props} value={value === null ? '' : value} onChange={handleTextFieldChange} />
  );
};

/**
 * Returns a new object with the given value at the specified path.
 * Doesn't modify the given object.
 *
 * @param {Object} object
 * @param {Array} propertyChain
 * @param {*} value
 * @returns {Object}
 */
const setIn = (object, [property, ...properyChain], value) =>
  properyChain.length === 0
    ? { ...object, [property]: value }
    : { ...object, [property]: setIn(object[property], properyChain, value) };

const EventConfig = ({ config, onChange }) => {
  const { stations, scramblers, runners, generateJudges } = config;

  const handleInputChange = propertyChain =>
    value => onChange(setIn(config, propertyChain, value));
  const handleCheckboxChange = propertyChain =>
    event => onChange(setIn(config, propertyChain, event.target.checked));

  return (
    <Grid container>
      <Grid item item xs={12} md={6}>
        <Grid container direction="column">
          <Grid>
            <PositiveIntegerInput
              margin="normal"
              label="Timing stations"
              value={stations}
              onChange={handleInputChange(['stations'])}
            />
          </Grid>
          <Grid item>
            <PositiveIntegerInput
              label="Scramblers"
              disabled={scramblers === 0}
              value={scramblers}
              onChange={handleInputChange(['scramblers'])}
            />
            <Checkbox
              checked={scramblers !== 0}
              onChange={event => handleInputChange(['scramblers'])(event.target.checked ? null : 0)}
            />
          </Grid>
          <Grid item>
            <PositiveIntegerInput
              label="Runners"
              disabled={runners === 0}
              value={runners}
              onChange={handleInputChange(['runners'])}
            />
            <Checkbox
              checked={runners !== 0}
              onChange={event => handleInputChange(['runners'])(event.target.checked ? null : 0)}
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={<Checkbox checked={generateJudges} onChange={handleCheckboxChange(['generateJudges'])} />}
              label="Generate judges"
            />
          </Grid>
        </Grid>
      </Grid>
      {config.configByRound && (
        <Grid item xs={12} md={6}>
          <Grid container direction="column" spacing={16}>
            {Object.entries(config.configByRound).map(([roundId, roundConfig], index) =>
              <Grid item key={roundId}>
                <Typography variant="body2">Round {index + 1}</Typography>
                <PositiveIntegerInput
                  label="Groups"
                  helperText="X people in group"
                  value={roundConfig.groups}
                  onChange={handleInputChange(['configByRound', roundId, 'groups'])}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  )
};

export default EventConfig;
