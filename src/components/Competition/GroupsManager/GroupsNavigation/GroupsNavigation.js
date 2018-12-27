import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoomName from '../../../common/RoomName/RoomName';
import GroupDialog from '../GroupDialog/GroupDialog';
import { parseActivityCode, hasDistributedAttempts } from '../../../../logic/activities';
import { flatMap, shortTime } from '../../../../logic/utils';

export default class RoundWithGroups extends Component {
  state = {
    openedGroupActivity: null
  };

  handleGroupClick = groupActivity => {
    this.setState({ openedGroupActivity: groupActivity });
  };

  handleDialogClose = () => {
    this.setState({ openedGroupActivity: null });
  };

  render() {
    const { openedGroupActivity } = this.state;
    const { wcif } = this.props;
    const events = wcif.events.filter(event => !hasDistributedAttempts(event.id));

    return (
      <React.Fragment>
        <RoundsNavigation events={events} render={this.renderRound} />
        {openedGroupActivity && (
          <GroupDialog
            open={true}
            groupActivity={openedGroupActivity}
            wcif={wcif}
            onClose={this.handleDialogClose}
          />
        )}
      </React.Fragment>
    );
  }

  renderRound = roundId => {
    const { wcif } = this.props;
    const roomsWithTimezoneAndGroups = flatMap(wcif.schedule.venues, venue =>
      venue.rooms.map(room =>
        [room, venue.timezone, flatMap(
          room.activities.filter(activity => activity.activityCode === roundId),
          activity => activity.childActivities
        )]
      )
    );

    return (
      <Grid container>
        {roomsWithTimezoneAndGroups.map(([room, timezone, groupActivities]) => (
          groupActivities.length > 0 && (
            <Grid item xs={12} sm key={room.id}>
              <RoomName room={room} />
              <List>
                {groupActivities.map(groupActivity => (
                  <ListItem key={groupActivity.id} button onClick={() => this.handleGroupClick(groupActivity)}>
                    <ListItemText
                      primary={`Group ${parseActivityCode(groupActivity.activityCode).groupNumber}`}
                      secondary={`${shortTime(groupActivity.startTime, timezone)} - ${shortTime(groupActivity.endTime, timezone)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )
        ))}
      </Grid>
    );
  };
}
