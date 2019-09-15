import React from 'react';
import Grid from '@material-ui/core/Grid';

import RoundActivityConfig from '../RoundActivityConfig/RoundActivityConfig';
import RoomName from '../../../common/RoomName/RoomName';
import { flatMap } from '../../../../logic/utils';
import { updateActivity, rooms } from '../../../../logic/activities';

const RoundConfig = React.memo(
  ({ roundId, wcif, onWcifChange, expectedCompetitorsByRound }) => {
    const activitiesWithRooms = flatMap(rooms(wcif), room =>
      room.activities
        .filter(activity => activity.activityCode === roundId)
        .map(activity => [activity, room])
    );

    return (
      <Grid container spacing={1}>
        {activitiesWithRooms.map(([activity, room]) => (
          <Grid item xs key={activity.id}>
            <RoomName room={room} />
            <RoundActivityConfig
              wcif={wcif}
              activity={activity}
              room={room}
              onChange={activity =>
                onWcifChange(updateActivity(wcif, activity))
              }
              expectedCompetitors={expectedCompetitorsByRound[roundId]}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
);

export default RoundConfig;
