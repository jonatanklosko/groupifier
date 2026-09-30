import React, { useState, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoundConfig from '../RoundConfig/RoundConfig';
import {
  populateRoundActivitiesConfig,
  anyActivityConfig,
  hasDistributedAttempts,
  activitiesWithUnpopulatedConfig,
  activityCodeToName,
} from '../../../../logic/activities';
import { uniq } from '../../../../logic/utils';

const RoundsConfig = ({ wcif, onWcifChange, expectedCompetitorsByRound }) => {
  const [options, setOptions] = useState({
    assignScramblers: true,
    assignRunners: true,
    assignJudges: true,
    assignStations: true,
  });

  const handleNextClick = () => {
    onWcifChange(
      populateRoundActivitiesConfig(wcif, expectedCompetitorsByRound, options)
    );
  };

  const events = wcif.events.filter(event => !hasDistributedAttempts(event.id));

  const activityCodesMissingConfig = uniq(
    activitiesWithUnpopulatedConfig(wcif).map(activity => activity.activityCode)
  );

  const renderRound = useCallback(
    roundId => (
      <RoundConfig
        roundId={roundId}
        expectedCompetitorsByRound={expectedCompetitorsByRound}
        wcif={wcif}
        onWcifChange={onWcifChange}
      />
    ),
    [wcif, onWcifChange, expectedCompetitorsByRound]
  );

  return activityCodesMissingConfig.length === 0 ? (
    <RoundsNavigation events={events} render={renderRound} />
  ) : (
    <Paper style={{ padding: 16 }}>
      <Typography variant="h5">
        {anyActivityConfig(wcif)
          ? `Generate missing configuration for
          ${activityCodesMissingConfig.map(activityCodeToName).join(', ')}`
          : `Generate initial configuration`}
      </Typography>
      <Grid container direction="column">
        <Grid item style={{ margin: '0.5em 0' }}>
          <Typography variant="body1">
            Which of the following would you like to assign?
          </Typography>
        </Grid>
        {['Scramblers', 'Runners', 'Judges', 'Stations'].map(label => (
          <Grid item key={label}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options[`assign${label}`]}
                  name={`assign${label}`}
                  onChange={event => {
                    const { checked, name } = event.target;
                    setOptions({ ...options, [name]: checked });
                  }}
                />
              }
              label={label}
            />
          </Grid>
        ))}
        <FormHelperText>
          Note that this is printing and assigning only, you have to control if
          there is enough stations for everyone manually
        </FormHelperText>
      </Grid>
      <Button onClick={handleNextClick}>Next</Button>
    </Paper>
  );
};

export default RoundsConfig;
