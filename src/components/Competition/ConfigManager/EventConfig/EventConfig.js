import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';

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

const EventConfig = ({ config, onChange }) => {
  const { stations, scramblers, runners, generateJudges } = config;

  const handleInputChange = property =>
    value => onChange({ ...config, [property]: value });
  const handleCheckboxChange = property =>
    event => onChange({ ...config, [property]: event.target.checked });

  return (
    <Grid container direction="column">
      <Grid item>
        <PositiveIntegerInput
          margin="normal"
          label="Timing stations"
          value={stations}
          onChange={handleInputChange('stations')}
        />
      </Grid>
      <Grid item>
        <PositiveIntegerInput
          label="Scramblers"
          disabled={scramblers === 0}
          value={scramblers}
          onChange={handleInputChange('scramblers')}
        />
        <Checkbox
          checked={scramblers !== 0}
          onChange={event => handleInputChange('scramblers')(event.target.checked ? null : 0)}
        />
      </Grid>
      <Grid item>
        <PositiveIntegerInput
          label="Runners"
          disabled={runners === 0}
          value={runners}
          onChange={handleInputChange('runners')}
        />
        <Checkbox
          checked={runners !== 0}
          onChange={event => handleInputChange('runners')(event.target.checked ? null : 0)}
        />
      </Grid>
      <Grid item>
        <FormControlLabel
          control={<Checkbox checked={generateJudges} onChange={handleCheckboxChange('generateJudges')} />}
          label="Generate judges"
        />
      </Grid>
    </Grid>
  )
};

export default EventConfig;
