import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { downloadScorecards } from '../../../logic/scorecards';
import { roundsMissingScorecards } from '../../../logic/activities';

export default class ConfigManager extends Component {
  printScorecards = () => {
    const { wcif } = this.props;
    const rounds =  roundsMissingScorecards(wcif);
    downloadScorecards(wcif, rounds);
  };

  render() {
    const { wcif } = this.props;

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <Button onClick={this.printScorecards}>Print sample scorecards</Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/competitions/${wcif.id}`}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
