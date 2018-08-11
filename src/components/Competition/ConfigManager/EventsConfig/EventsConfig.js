import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Grid from 'material-ui/Grid';
import { FormControlLabel } from 'material-ui/Form';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import EventPanel from '../EventPanel/EventPanel';
import { differ, isPresentDeep } from '../../../../logic/helpers';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';
import { suggestedGroupCount } from '../../../../logic/groups';

export default class EventsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleReady = () => {
    const { wcif, competitorsByRound } = this.props;

    this.handleEventsChange(
      wcif.events.map(wcifEvent =>
        setGroupifierData('Event', wcifEvent, {})
      )
    );
  };

  handleEventChange = updatedWcifEvent => {
    this.handleEventsChange(
      this.props.wcif.events.map(wcifEvent => wcifEvent.id === updatedWcifEvent.id ? updatedWcifEvent : wcifEvent)
    );
  };

  handleEventsChange(events) {
    const { wcif, onWcifChange, competitorsByRound } = this.props;

    const eventsWithUpdatedGroups = events.map(newEvent => {
      const oldEvent = wcif.events.find(oldEvent => oldEvent.id === newEvent.id);
      if (newEvent === oldEvent) return newEvent;
      const [newEventConfig, oldEventConfig] = [newEvent, oldEvent].map(getGroupifierData);
      const stationsChanged = differ(newEventConfig, oldEventConfig, ['stations']);
      const rounds = newEvent.rounds.map(newRound => {
        const oldRound = oldEvent.rounds.find(oldRound => oldRound.id === newRound.id);
        if (!stationsChanged && newRound === oldRound) return newRound;
        const [newRoundConfig, oldRoundConfig] = [newRound, oldRound].map(getGroupifierData);
        const separateGroupsRoundChanged = differ(newRoundConfig, oldRoundConfig, ['separateGroups', 'roundId']);
        if (!separateGroupsRoundChanged && !stationsChanged) return newRound;
        const { separateGroups } = newRoundConfig || {};
        const separateGroupsCompetitors = separateGroups ? competitorsByRound[separateGroups.roundId] : [];
        const competitors = competitorsByRound[newRound.id]
          .filter(person => !separateGroupsCompetitors.includes(person));
        return setGroupifierData('Round', newRound, {
         ...newRoundConfig,
         groups: suggestedGroupCount(competitors.length, newEvent.id, newEventConfig.stations, 2),
         separateGroups: separateGroups ? {
           ...separateGroups,
           groups: suggestedGroupCount(separateGroupsCompetitors.length, newEvent.id, newEventConfig.stations, 1)
         } : false
        });
      });
      return { ...newEvent, rounds };
    });

    onWcifChange({ ...wcif, events: eventsWithUpdatedGroups });
  }

  render() {
    const { wcif, competitorsByRound } = this.props;

    const showEventsConfig = wcif.events.some(wcifEvent => getGroupifierData(wcifEvent));

    return showEventsConfig ? (
      wcif.events.map(wcifEvent =>
        <EventPanel
          key={wcifEvent.id}
          wcif={wcif}
          wcifEvent={wcifEvent}
          competitorsByRound={competitorsByRound}
          onChange={this.handleEventChange}
        />
      )
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="headline">Generate configuration</Typography>
        <Grid direction="column">
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  name="runners"
                />
              }
              label="Do you use runners system?"
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  name="assignJudges"
                />
              }
              label="Should judges be assigned?"
            />
          </Grid>
        </Grid>
        <Button onClick={this.handleReady}>
          Ready
        </Button>
      </Paper>
    );
  }
}
