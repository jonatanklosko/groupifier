import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { getExtensionData, setExtensionData } from '../../../../logic/wcif-extensions';
import { setIn } from '../../../../logic/utils';

const competitorsSortingRules = [{
  id: 'ranks',
  name: 'Official rankings',
  description: 'Sort competitors by their official rankings.'
}, {
  id: 'balanced',
  name: 'Balanced',
  description: 'Sort competitors in 3x3x3 (any variation), 2x2x2, Pyraminx and Skewb by their official rankings. For other events put best people in different groups, so that there are good scramblers for each group.'
}, {
  id: 'name-optimised',
  name: 'Name-optimised',
  description: 'Sort competitors by their official rankings, but also minimize the number of people with the same name in each group. Use it when many competitors have the same name.'
}];

export default class GeneralConfig extends Component {
  handlePropertyChange = (property, value) => {
    const { wcif, onWcifChange } = this.props;
    onWcifChange(
      setExtensionData('CompetitionConfig', wcif, setIn(getExtensionData('CompetitionConfig', wcif), [property], value))
    );
  };

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.handlePropertyChange(name, checked);
  };

  handleTextFieldChange = event => {
    const { name, value } = event.target;
    this.handlePropertyChange(name, value);
  };

  render() {
    const { wcif } = this.props;
    const { competitorsSortingRule, localNamesFirst, scorecardsBackgroundUrl } = getExtensionData('CompetitionConfig', wcif);

    return (
      <Paper style={{ padding: 16 }}>
        <Grid container direction="column" spacing={16}>
          <Grid item>
            <Typography variant="h5">Assignments</Typography>
            <FormControl fullWidth>
              <InputLabel htmlFor="competitors-sorting-rule">Competitors sorting rule</InputLabel>
              <Select
                value={competitorsSortingRule}
                onChange={this.handleTextFieldChange}
                inputProps={{ name: 'competitorsSortingRule', id: 'competitors-sorting-rule' }}
              >
                {competitorsSortingRules.map(({ id, name }) => (
                  <MenuItem value={id} key={id}>{name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {competitorsSortingRules.find(({ id }) => id === competitorsSortingRule).description + ' Note: this applies to first rounds only.'}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item>
            <Typography variant="h5">Printing</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="localNamesFirst"
                  checked={localNamesFirst}
                  onChange={this.handleCheckboxChange}
                />
              }
              label="Swap latin names with local ones"
            />
            <TextField
              label="Scorecards background image URL"
              name="scorecardsBackgroundUrl"
              value={scorecardsBackgroundUrl}
              onChange={this.handleTextFieldChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>
    );
  }
}
