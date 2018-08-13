import React, { PureComponent } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';

import RoundActivityConfig from '../RoundActivityConfig/RoundActivityConfig';

import PositiveIntegerInput from '../../../common/PositiveIntegerInput/PositiveIntegerInput';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';
import { setIn, updateIn } from '../../../../logic/helpers';
import { roundIdToName, roundIdToShortName } from '../../../../logic/formatters';

export default class RoundConfig extends PureComponent {
  groupSizeText(competitors, groups) {
    if (!groups) return '';
    const groupSize = Math.ceil(competitors.length / groups);
    return `${groupSize} ${groupSize === 1 ? 'person' : 'people'} in group`;
  };

  handleActivityChange = updatedActivity => {
    const { wcif, onWcifChange } = this.props;
    onWcifChange(
      updateIn(wcif, ['schedule', 'venues', '0', 'rooms'], rooms =>
        rooms.map(room => ({
          ...room,
          activities: room.activities.map(activity => activity.id === updatedActivity.id ? updatedActivity : activity)
        }))
      )
    );
  };

  render() {
    const { round, wcif, competitorsByRound } = this.props;

    const competitors = competitorsByRound[round.id];

    const flatMap = (arr, fn) =>
      arr.reduce((xs, x) => xs.concat(fn(x)), []);

    const activitiesWithRooms = flatMap(wcif.schedule.venues[0].rooms, room =>
      room.activities
        .filter(activity => activity.activityCode === round.id)
        .map(activity => [activity, room])
    );

    return (
      <div>
        <Typography variant="subheading">{roundIdToShortName(round.id)}</Typography>
        <Grid container spacing={16}>
        {activitiesWithRooms.map(([activity, room]) =>
          <Grid item xs key={room.id}>
            <Typography variant="body2">
              <span style={{
                  display: 'inline-block',
                  width: 10, height: 10, marginRight: 5,
                  borderRadius: '100%', backgroundColor: room.color
                }}
              />
              <span>{room.name}</span>
            </Typography>
            <RoundActivityConfig activity={activity} onChange={this.handleActivityChange} />
          </Grid>
        )}
      </Grid>
      </div>
    );
  }
}
