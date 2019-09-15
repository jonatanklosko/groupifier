import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import Scorecards from './Scorecards/Scorecards';
import CompetitorCards from './CompetitorCards/CompetitorCards';

const PrintingManager = ({ wcif }) => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Grid container spacing={1} justify="flex-end">
      <Grid item xs={12}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabValue}
            onChange={(event, value) => setTabValue(value)}
            centered
          >
            <Tab label="Scorecards" />
            <Tab label="Competitor cards" />
          </Tabs>
        </AppBar>
      </Grid>
      <Grid item xs={12}>
        {tabValue === 0 && <Scorecards wcif={wcif} />}
        {tabValue === 1 && <CompetitorCards wcif={wcif} />}
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
};

export default PrintingManager;
