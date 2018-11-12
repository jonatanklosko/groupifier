import React, { PureComponent } from 'react';
import Grid from '@material-ui/core/Grid';

import RoundActivityConfig from '../RoundActivityConfig/RoundActivityConfig';
import RoomName from '../../../common/RoomName/RoomName';
import { flatMap } from '../../../../logic/utils';
import { updateActivity } from '../../../../logic/activities';

export default class RoundConfig extends PureComponent {
  handleActivityChange = activity => {
    const { wcif, onWcifChange } = this.props;
    onWcifChange(updateActivity(wcif, activity));
  };

  render() {
    const { roundId, wcif, expectedCompetitorsByRound } = this.props;

    const activitiesWithRooms = flatMap(wcif.schedule.venues[0].rooms, room =>
      room.activities
        .filter(activity => activity.activityCode === roundId)
        .map(activity => [activity, room])
    );

    return (
      <Grid container spacing={16}>
        {activitiesWithRooms.map(([activity, room]) =>
          <Grid item xs key={activity.id}>
            <RoomName room={room} />
            <RoundActivityConfig
              wcif={wcif}
              activity={activity}
              room={room}
              onChange={this.handleActivityChange}
              expectedCompetitors={expectedCompetitorsByRound[roundId]}
            />
          </Grid>
        )}
      </Grid>
    );
  }
}
