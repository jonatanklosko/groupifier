import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import RoomName from '../../../common/RoomName/RoomName';
import GroupDialog from '../GroupDialog/GroupDialog';
import { parseActivityCode, activityCodeToName } from '../../../../logic/activities';
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
    const { wcif, roundId } = this.props;

    const roomsWithGroups = wcif.schedule.venues[0].rooms.map(room =>
      [room,
      flatMap(room.activities
        // .filter(activity => activity.activityCode.startsWith(round.id))
        .filter(activity => activity.activityCode === roundId),
        activity => activity.childActivities)
      ]
    );

    return (
      <ExpansionPanel onChange={this.handlePanelChange}>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <Typography variant="subtitle1">
            {activityCodeToName(roundId)}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {openedGroupActivity && (
            <GroupDialog open={true} groupActivity={openedGroupActivity} wcif={wcif} onClose={this.handleDialogClose} />
          )}
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
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
