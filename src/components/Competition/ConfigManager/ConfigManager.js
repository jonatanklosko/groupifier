import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import RoomsConfig from './RoomsConfig/RoomsConfig';
import RoundsConfig from './RoundsConfig/RoundsConfig';
import GeneralConfig from './GeneralConfig/GeneralConfig';
import SaveWcifButton from '../../common/SaveWcifButton/SaveWcifButton';
import { getExpectedCompetitorsByRound } from '../../../logic/competitors';
import {
  roomsConfigComplete,
  activitiesConfigComplete,
  anyGroupAssignedOrCreated,
} from '../../../logic/activities';
import { removeExtensionData } from '../../../logic/wcif-extensions';
import { mapIn } from '../../../logic/utils';

const ConfigManager = ({ wcif, onWcifUpdate }) => {
  const [localWcif, setLocalWcif] = useState(wcif);
  const [tabValue, setTabValue] = useState(0);
  const expectedCompetitorsByRound = useMemo(
    () => getExpectedCompetitorsByRound(wcif),
    [wcif]
  );

  const clearConfig = () => {
    const withoutCompetitionConfig = removeExtensionData(
      'CompetitionConfig',
      localWcif
    );
    setLocalWcif(
      mapIn(withoutCompetitionConfig, ['schedule', 'venues'], venue =>
        mapIn(venue, ['rooms'], room =>
          removeExtensionData(
            'RoomConfig',
            mapIn(room, ['activities'], activity =>
              removeExtensionData('ActivityConfig', activity)
            )
          )
        )
      )
    );
    setTabValue(0);
  };

  const wcifConfigComplete =
    roomsConfigComplete(localWcif) && activitiesConfigComplete(localWcif);

  return (
    <Grid container spacing={1} justify="flex-end">
      <Grid item xs={12}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabValue}
            onChange={(event, value) => setTabValue(value)}
            centered
          >
            <Tab label="Rooms" />
            <Tab label="Rounds" disabled={!roomsConfigComplete(localWcif)} />
            <Tab label="General" />
          </Tabs>
        </AppBar>
      </Grid>
      <Grid item xs={12}>
        {tabValue === 0 && (
          <RoomsConfig wcif={localWcif} onWcifChange={setLocalWcif} />
        )}
        {tabValue === 1 && (
          <RoundsConfig
            wcif={localWcif}
            onWcifChange={setLocalWcif}
            expectedCompetitorsByRound={expectedCompetitorsByRound}
          />
        )}
        {tabValue === 2 && (
          <GeneralConfig wcif={localWcif} onWcifChange={setLocalWcif} />
        )}
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          component={Link}
          to={`/competitions/${localWcif.id}`}
        >
          Cancel
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          onClick={clearConfig}
          disabled={anyGroupAssignedOrCreated(localWcif)}
        >
          Clear
        </Button>
      </Grid>
      <Grid item>
        <SaveWcifButton
          wcif={wcif}
          updatedWcif={localWcif}
          onWcifUpdate={onWcifUpdate}
          disabled={!wcifConfigComplete}
        />
      </Grid>
    </Grid>
  );
};

export default ConfigManager;
