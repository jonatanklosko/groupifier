import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { getExtensionData, setExtensionData } from '../../../../logic/wcif-extensions';
import { setIn } from '../../../../logic/utils';

export default class GeneralConfig extends Component {
  get competitionData() {
    return getExtensionData('CompetitionConfig', this.props.wcif) || { localNamesFirst: false };
  }

  handleCheckboxChange = event => {
    const { wcif, onWcifChange } = this.props;
    const { name, checked } = event.target;
    onWcifChange(
      setExtensionData('CompetitionConfig', wcif, setIn(this.competitionData, [name], checked))
    );
  };

  render() {
    const { localNamesFirst } = this.competitionData;

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
        </Grid>
      </Paper>
    );
  }
}
