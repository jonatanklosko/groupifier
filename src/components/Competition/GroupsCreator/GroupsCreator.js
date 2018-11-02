import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import { createGroupActivities, assignTasks } from '../../../logic/groups';
import { roundsMissingAssignments } from '../../../logic/activities';

export default class GroupsCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localWcif: props.wcif
    };
  }

  handleWcifChange = wcif => {
    this.setState({ localWcif: wcif });
  };

  createGroups = () => {
    const wcifWithGroups = createGroupActivities(this.state.localWcif);
    const start = performance.now();
    const wcifWithAssignments = assignTasks(wcifWithGroups);
    console.log(wcifWithAssignments);
    console.log('Took', performance.now() - start);
    this.setState({ localWcif: wcifWithAssignments });
  };

  render() {
    const { localWcif } = this.state;
    const { onWcifUpdate } = this.props;

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          {roundsMissingAssignments(localWcif).length > 0 && (
            <SnackbarContent message="There are rounds with no tasks assigned" action={
              <Button onClick={this.createGroups} color="secondary" size="small">
                Assign tasks
              </Button>
            }/>
          )}
        </Grid>
        <Grid item>
          <Button variant="contained" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onWcifUpdate(localWcif)}
            component={Link}
            to={`/competitions/${localWcif.id}`}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
