import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import CubingIcon from '../../common/CubingIcon/CubingIcon';
import { downloadScorecards } from '../../../logic/scorecards';
import { roundsMissingScorecards, parseActivityCode, activityCodeToName } from '../../../logic/activities';
import { difference } from '../../../logic/utils';

export default class PrintingManager extends Component {
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
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <Paper style={{ padding: 16 }}>
            <Typography variant="h5">Scorecards</Typography>
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
            <Button
              onClick={this.handleDownloadClick}
              disabled={selectedRounds.length === 0}
            >
              Download scorecards
            </Button>
          </Paper>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/competitions/${wcif.id}`}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    );
  }
}
