import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoomName from '../../../common/RoomName/RoomName';
import GroupDialog from '../GroupDialog/GroupDialog';
import { activityDurationString, parseActivityCode, hasDistributedAttempts, roomsWithTimezoneAndGroups } from '../../../../logic/activities';

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

    return (
      <Grid container>
        {roomsWithTimezoneAndGroups(wcif, roundId).map(([room, timezone, groupActivities]) => (
          groupActivities.length > 0 && (
            <Grid item xs={12} sm key={room.id}>
              <RoomName room={room} />
              <List>
                {groupActivities.map(groupActivity => (
                  <ListItem key={groupActivity.id} button onClick={() => this.handleGroupClick(groupActivity)}>
                    <ListItemText
                      primary={`Group ${parseActivityCode(groupActivity.activityCode).groupNumber}`}
                      secondary={activityDurationString(groupActivity, timezone)}
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
