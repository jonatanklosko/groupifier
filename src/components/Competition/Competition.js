import React, { Fragment, useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CompetitionMenu from './CompetitionMenu/CompetitionMenu';
import NewAssignableRoundNotification from './NewAssignableRoundNotification/NewAssignableRoundNotification';
import ConfigManager from './ConfigManager/ConfigManager';
import GroupsManager from './GroupsManager/GroupsManager';
import PrintingManager from './PrintingManager/PrintingManager';
import RolesManager from './RolesManager/RolesManager';

import { getWcif } from '../../logic/wca-api';
import { sortWcifEvents } from '../../logic/events';
import { updateIn } from '../../logic/utils';
import { validateWcif } from '../../logic/wcif-validation';

const Competition = ({ match }) => {
  const [wcif, setWcif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    getWcif(match.params.competitionId)
      /* Sort events, so that we don't need to remember about this everywhere. */
      .then(wcif => updateIn(wcif, ['events'], sortWcifEvents))
      .then(wcif => {
        setWcif(wcif);
        setErrors(validateWcif(wcif));
      })
      .catch(error => setErrors([error.message]))
      .finally(() => setLoading(false));
  }, [match.params.competitionId]);

  return loading ? (
    <LinearProgress />
  ) : (
    <div>
      {errors.length === 0 ? (
        <Fragment>
          <Typography variant="h5" gutterBottom>
            {wcif.name}
          </Typography>
          <Switch>
            <Route
              exact
              path={match.url}
              render={props => (
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <CompetitionMenu
                      {...props}
                      wcif={wcif}
                      baseUrl={match.url}
                    />
                  </Grid>
                  <Grid item>
                    <NewAssignableRoundNotification
                      wcif={wcif}
                      onWcifUpdate={setWcif}
                    />
                  </Grid>
                </Grid>
              )}
            />
            <Route
              path={`${match.url}/roles`}
              render={props => (
                <RolesManager {...props} wcif={wcif} onWcifUpdate={setWcif} />
              )}
            />
            <Route
              path={`${match.url}/config`}
              render={props => (
                <ConfigManager {...props} wcif={wcif} onWcifUpdate={setWcif} />
              )}
            />
            <Route
              path={`${match.url}/groups`}
              render={props => (
                <GroupsManager {...props} wcif={wcif} onWcifUpdate={setWcif} />
              )}
            />
            <Route
              path={`${match.url}/printing`}
              render={props => <PrintingManager {...props} wcif={wcif} />}
            />
          </Switch>
        </Fragment>
      ) : (
        <Fragment>
          <Typography variant="h5">Failed to load competition data</Typography>
          <List>
            {errors.map(error => (
              <ListItem key={error}>
                <ListItemText>{error}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Fragment>
      )}
    </div>
  );
};

export default Competition;
