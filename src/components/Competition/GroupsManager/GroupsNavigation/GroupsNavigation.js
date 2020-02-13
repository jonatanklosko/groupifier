import React, { Fragment, useState, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoomName from '../../../common/RoomName/RoomName';
import GroupDialog from '../GroupDialog/GroupDialog';
import GroupsEditor from '../GroupsEditor/GroupsEditor';
import {
  activityDurationString,
  activityCodeToGroupName,
  hasDistributedAttempts,
  roomsWithTimezoneAndGroups,
  groupActivitiesByRound,
} from '../../../../logic/activities';

const GroupsNavigation = ({ wcif, onWcifChange }) => {
  const [openedGroupActivity, setOpenGroupActivity] = useState(null);
  const [editedRoundId, setEditedRoundId] = useState(null);
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
                        primary={activityCodeToGroupName(
                          groupActivity.activityCode
                        )}
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

  const renderActions = roundId => {
    const anyGroup = groupActivitiesByRound(wcif, roundId).length > 0;
    if (!anyGroup) return false;
    return <Button onClick={() => setEditedRoundId(roundId)}>Edit</Button>;
  };

  return (
    <Fragment>
      <RoundsNavigation
        events={events}
        render={renderRound}
        renderActions={renderActions}
      />
      {openedGroupActivity && (
        <GroupDialog
          groupActivity={openedGroupActivity}
          wcif={wcif}
          onClose={() => setOpenGroupActivity(null)}
        />
      )}
      {editedRoundId && (
        <GroupsEditor
          wcif={wcif}
          roundId={editedRoundId}
          onClose={wcif => {
            onWcifChange(wcif);
            setEditedRoundId(null);
          }}
        />
      )}
    </Fragment>
  );
};

export default GroupsNavigation;
