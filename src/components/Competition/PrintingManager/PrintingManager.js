import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import pink from '@material-ui/core/colors/pink';

import Scorecards from './Scorecards/Scorecards';
import CompetitorCards from './CompetitorCards/CompetitorCards';
import {
  roundsMissingAssignments,
  activityCodeToName,
} from '../../../logic/activities';

const PrintingManager = ({ wcif }) => {
  const [tabValue, setTabValue] = useState(0);

  const roundsMissingAssignmentsNames = roundsMissingAssignments(wcif).map(
    round => activityCodeToName(round.id)
  );

  return (
    <Grid container spacing={1} justify="flex-end">
      <Grid item xs={12}>
        {roundsMissingAssignmentsNames.length > 0 && (
          <SnackbarContent
            style={{ maxWidth: 'none' }}
            message={`
              The following rounds are missing task assignments:
              ${roundsMissingAssignmentsNames.join(', ')}.
              You may want to assign them first.
            `}
            action={
              <Button
                component={Link}
                to={`/competitions/${wcif.id}/groups`}
                style={{ color: pink[500] }}
                size="small"
              >
                Manage groups
              </Button>
            }
          />
        )}
      </Grid>
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
