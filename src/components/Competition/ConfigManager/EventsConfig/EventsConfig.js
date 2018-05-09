import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import EventConfig from '../EventConfig/EventConfig';
import EventPanel from '../EventPanel/EventPanel';
import { differ } from '../../../../logic/helpers';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';
import { suggestedGroupCount } from '../../../../logic/groups';

export default class EventsConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultEventConfig: {
        stations: null,
        scramblers: null,
        runners: null,
        generateJudges: true
      }
    }
  }

  handleDefaultEventConfigChange = config => {
    this.setState({ defaultEventConfig: config });
  };

  handleDefaultEventConfigReady = () => {
    const { defaultEventConfig } = this.state;
    const { wcif, competitorsByRound } = this.props;

    this.handleEventsChange(
      wcif.events.map(wcifEvent =>
        setGroupifierData('Event', wcifEvent, defaultEventConfig)
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
         } : null
        });
      });
      return { ...newEvent, rounds };
    });

    onWcifChange({ ...wcif, events: eventsWithUpdatedGroups });
  }

  render() {
    const { wcif, competitorsByRound } = this.props;
    const { defaultEventConfig } = this.state;

    const showEventsConfig = wcif.events.some(wcifEvent => getGroupifierData(wcifEvent));

    return showEventsConfig ? (
      wcif.events.map(wcifEvent =>
        <EventPanel
          key={wcifEvent.id}
          wcifEvent={wcifEvent}
          competitorsByRound={competitorsByRound}
          onChange={this.handleEventChange}
        />
      )
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="headline">Default configuration</Typography>
        <EventConfig
          config={defaultEventConfig}
          onChange={this.handleDefaultEventConfigChange}
        />
        <Button
          onClick={this.handleDefaultEventConfigReady}
          disabled={Object.values(defaultEventConfig).some(value => value === null)}
        >
          Ready
        </Button>
      </Paper>
    );
  }
}
