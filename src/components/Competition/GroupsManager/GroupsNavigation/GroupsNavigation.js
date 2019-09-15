import React, { Fragment, useState, useCallback } from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoomName from '../../../common/RoomName/RoomName';
import GroupDialog from '../GroupDialog/GroupDialog';
import {
  activityDurationString,
  parseActivityCode,
  hasDistributedAttempts,
  roomsWithTimezoneAndGroups,
} from '../../../../logic/activities';

const GroupsNavigation = ({ wcif }) => {
  const [openedGroupActivity, setOpenGroupActivity] = useState(null);
  const events = wcif.events.filter(event => !hasDistributedAttempts(event.id));

  const renderRound = useCallback(
    roundId => (
      <Grid container>
        {roomsWithTimezoneAndGroups(wcif, roundId).map(
          ([room, timezone, groupActivities]) =>
            groupActivities.length > 0 && (
              <Grid item xs={12} sm key={room.id}>
                <RoomName room={room} />
                <List>
                  {groupActivities.map(groupActivity => (
                    <ListItem
                      key={groupActivity.id}
                      button
                      onClick={() => setOpenGroupActivity(groupActivity)}
                    >
                      <ListItemText
                        primary={`Group ${
                          parseActivityCode(groupActivity.activityCode)
                            .groupNumber
                        }`}
                        secondary={activityDurationString(
                          groupActivity,
                          timezone
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )
        )}
      </Grid>
    ),
    [wcif]
  );

  return (
    <Fragment>
      <RoundsNavigation events={events} render={renderRound} />
      {openedGroupActivity && (
        <GroupDialog
          groupActivity={openedGroupActivity}
          wcif={wcif}
          onClose={() => setOpenGroupActivity(null)}
        />
      )}
    </Fragment>
  );
};

export default GroupsNavigation;
