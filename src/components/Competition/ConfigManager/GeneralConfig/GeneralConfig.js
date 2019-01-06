import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { getExtensionData, setExtensionData } from '../../../../logic/wcif-extensions';
import { setIn } from '../../../../logic/utils';

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
    const { localNamesFirst, scorecardsBackgroundUrl } = getExtensionData('CompetitionConfig', wcif);

    return (
      <Paper style={{ padding: 16 }}>
        <Typography variant="h5">Printing</Typography>
        <Grid container direction="column">
          <Grid item>
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
          </Grid>
          <Grid item>
            <TextField
              label="Scorecards background image URL"
              name="scorecardsBackgroundUrl"
              value={scorecardsBackgroundUrl || ''}
              onChange={this.handleTextFieldChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>
    );
  }
}
