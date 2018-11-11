import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import RoundsNavigation from '../../../common/RoundsNavigation/RoundsNavigation';
import RoomName from '../../../common/RoomName/RoomName';
import GroupDialog from '../GroupDialog/GroupDialog';
import { parseActivityCode } from '../../../../logic/activities';
import { flatMap } from '../../../../logic/utils';

const strftime = isoString =>
  new Date(isoString).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric' });

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

    return (
      <React.Fragment>
        <RoundsNavigation events={wcif.events} render={this.renderRound} />
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
    const roomsWithGroups = wcif.schedule.venues[0].rooms.map(room =>
      [room,
      flatMap(room.activities
        // .filter(activity => activity.activityCode.startsWith(round.id))
        .filter(activity => activity.activityCode === roundId),
        activity => activity.childActivities)
      ]
    );

    return (
      <Grid container>
        {roomsWithGroups.map(([room, groupActivities]) => (
          groupActivities.length > 0 && (
            <Grid item xs key={room.id}>
              <RoomName room={room} />
              <List>
                {groupActivities.map(groupActivity => (
                  <ListItem key={groupActivity.id} button onClick={() => this.handleGroupClick(groupActivity)}>
                    <ListItemText
                      primary={`Group ${parseActivityCode(groupActivity.activityCode).groupNumber}`}
                      secondary={`${strftime(groupActivity.startTime)} - ${strftime(groupActivity.endTime)}`}
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
