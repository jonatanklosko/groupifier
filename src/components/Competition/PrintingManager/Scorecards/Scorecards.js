import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';

import CubingIcon from '../../../common/CubingIcon/CubingIcon';
import { downloadScorecards } from '../../../../logic/scorecards';
import { roundsMissingScorecards, parseActivityCode, activityCodeToName } from '../../../../logic/activities';
import { difference } from '../../../../logic/utils';

export default class Scorecards extends Component {
  constructor(props) {
    super(props);
    const rounds = roundsMissingScorecards(this.props.wcif);
    const selectedRounds = rounds.every(round => parseActivityCode(round.id).roundNumber === 1) ? rounds : []
    this.state = {
      selectedRounds
    };
  }

  handleDownloadClick = () => {
    downloadScorecards(this.props.wcif, this.state.selectedRounds);
  };

  handleRoundClick = round => event => {
    const { selectedRounds } = this.state;
    this.setState({
      selectedRounds: selectedRounds.includes(round)
        ? difference(selectedRounds, [round])
        : [...selectedRounds, round]
    });
  };

  render() {
    const { selectedRounds } = this.state;
    const { wcif } = this.props;
    const rounds = roundsMissingScorecards(wcif);

    return (
      <Paper style={{ padding: 16 }}>
        <List style={{ width: 400 }}>
          {rounds.map(round => (
            <ListItem key={round.id} button onClick={this.handleRoundClick(round)}>
              <ListItemIcon>
                <CubingIcon eventId={parseActivityCode(round.id).eventId} />
              </ListItemIcon>
              <ListItemText primary={activityCodeToName(round.id)} />
              <Checkbox
                checked={selectedRounds.includes(round)}
                tabIndex={-1}
                disableRipple
                style={{ padding: 0 }}
              />
            </ListItem>
          ))}
        </List>
        <Button onClick={this.handleDownloadClick} disabled={selectedRounds.length === 0}>
          Download
        </Button>
      </Paper>
    );
  }
}
