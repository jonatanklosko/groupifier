import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Grid from 'material-ui/Grid';
import { FormControlLabel } from 'material-ui/Form';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import EventPanel from '../EventPanel/EventPanel';
import { differ, isPresentDeep, updateIn } from '../../../../logic/helpers';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';
import { suggestedGroupCount } from '../../../../logic/groups';

export default class EventsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignScramblers: true,
      assignRunners: true,
      assignJudges: true
    };
  }

  handleCheckboxChange = event => {
    const { name, checked } = event.target;
    this.setState({ [name]: checked });
  };

  handleNext = () => {
    const { assignScramblers, assignRunners, assignJudges } = this.state;
    const { wcif, competitorsByRound, onWcifChange } = this.props;

    const flatMap = (arr, fn) =>
      arr.reduce((xs, x) => xs.concat(fn(x)), []);

    const activityDuration = activity =>
      new Date(activity.endTime) - new Date(activity.startTime)

    const zip = (...arrs) =>
      arrs[0].map((_, i) => arrs.map(arr => arr[i]));

    const suggestedScramblerCount = stations =>
      Math.floor(Math.log2(stations + 1));

    const suggestedRunnerCount = stations =>
      Math.floor(Math.log(stations + 2) / Math.log(3));

    const activitiesWithStations = flatMap(wcif.schedule.venues[0].rooms, room =>
      room.activities.map(activity => [activity, getGroupifierData(room).stations])
    );
    const activities = flatMap(wcif.events, wcifEvent => {
      return flatMap(wcifEvent.rounds, round => {
        const competitors = competitorsByRound[round.id];
        const roundActivitiesWithStations = activitiesWithStations
          .filter(([activity, stations]) => activity.activityCode === round.id);
        const densities = roundActivitiesWithStations
          .map(([activity, stations]) => stations * activityDuration(activity));
        const densitiesSum = densities.reduce((x, y) => x + y, 0);
        const normalizedDensities = densities.map(density => densitiesSum !== 0 ? density / densitiesSum : 0);
        return zip(roundActivitiesWithStations, normalizedDensities).map(([[activity, stations], density]) =>
          setGroupifierData('Activity', activity, {
            density,
            groups: suggestedGroupCount(Math.floor(density * competitors.length), wcifEvent.id, stations, 2),
            scramblers: assignScramblers ? suggestedScramblerCount(stations) : 0,
            runners: assignRunners ? suggestedRunnerCount(stations) : 0,
            assignJudges
          })
        );
      });
    });

    const newWcif = updateIn(wcif, ['schedule', 'venues', '0', 'rooms'], rooms =>
      rooms.map(room => ({
        ...room,
        activities: room.activities.map(activity => activities.find(({ id }) => id === activity.id) || activity)
      }))
    );
    onWcifChange(newWcif);
  };

  render() {
    const { assignScramblers, assignRunners, assignJudges } = this.state;
    const { wcif, competitorsByRound } = this.props;

    const showEventsConfig = wcif.schedule.venues[0].rooms.some(room =>
      room.activities.some(getGroupifierData)
    );

    return showEventsConfig ? (
      wcif.events.map(wcifEvent =>
        <EventPanel
          key={wcifEvent.id}
          wcif={wcif}
          wcifEvent={wcifEvent}
          competitorsByRound={competitorsByRound}
          onWcifChange={this.props.onWcifChange}
        />
      )
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="headline">Generate configuration</Typography>
        <Grid container direction="column">
          {[['scramblers', 'assignScramblers'], ['runners', 'assignRunners'], ['judges', 'assignJudges']].map(([role, property]) =>
            <Grid item key={role}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state[property]}
                    name={property}
                    onChange={this.handleCheckboxChange}
                  />
                }
                label={`Should ${role} be assigned?`}
              />
            </Grid>
          )}
        </Grid>
        <Button onClick={this.handleNext}>
          Next
        </Button>
      </Paper>
    );
  }
}
