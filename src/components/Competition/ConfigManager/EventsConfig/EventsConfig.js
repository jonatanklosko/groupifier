import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import EventConfig from '../EventConfig/EventConfig';
import EventPanel from '../EventPanel/EventPanel';
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

    this.handleEventsConfigChange(
      wcif.events.map(wcifEvent => ({
          ...setGroupifierData('Event', wcifEvent, { ...defaultEventConfig }),
          rounds: wcifEvent.rounds.map(round =>
            setGroupifierData('Round', round, {
              groups: suggestedGroupCount(competitorsByRound[round.id].length, wcifEvent.id, defaultEventConfig.stations, 2),
              separateGroups: null
            })
          )
        })
      )
    );
  };


  handleEventChange = (updatedWcifEvent) => {
    this.handleEventsConfigChange(
      this.props.wcif.events.map(wcifEvent => wcifEvent.id === updatedWcifEvent.id ? updatedWcifEvent : wcifEvent)
    );
  };

  handleEventsConfigChange(events) {
    const { wcif } = this.props;
    this.props.onWcifChange({ ...wcif, events });
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
          wcifEvents={wcif.events}
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
