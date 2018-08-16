import React, { PureComponent } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import RoundActivityConfig from '../RoundActivityConfig/RoundActivityConfig';
import RoomName from '../../../common/RoomName/RoomName';
import { flatMap } from '../../../../logic/helpers';
import { roundIdToShortName } from '../../../../logic/formatters';
import { isActivityConfigurable, updateActivity } from '../../../../logic/activities';

export default class RoundConfig extends PureComponent {
  handleActivityChange = activity => {
    const { wcif, onWcifChange } = this.props;
    onWcifChange(updateActivity(wcif, activity));
  };

  render() {
    const { round, wcif, expectedCompetitorsByRound } = this.props;

    const activitiesWithRooms = flatMap(wcif.schedule.venues[0].rooms, room =>
      room.activities
        .filter(activity => activity.activityCode.startsWith(round.id))
        .filter(isActivityConfigurable)
        .map(activity => [activity, room])
    );

    return (
      <div>
        <Typography variant="subheading">{roundIdToShortName(round.id)}</Typography>
        <Grid container spacing={16}>
        {activitiesWithRooms.map(([activity, room]) =>
          <Grid item xs key={room.id}>
            <RoomName room={room} />
            <RoundActivityConfig
              activity={activity}
              room={room}
              onChange={this.handleActivityChange}
              expectedCompetitors={expectedCompetitorsByRound[round.id]}
            />
          </Grid>
        )}
      </Grid>
      </div>
    );
  }
}
