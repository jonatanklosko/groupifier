import React, { Component } from 'react';
import Button from 'material-ui/Button';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import Icon from 'material-ui/Icon';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import EventConfig from '../EventConfig/EventConfig';
import Events from '../../../../logic/Events';
import { mergeIn } from '../../../../logic/helpers';
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

  handleEventConfigChange = (config, eventId) => {
    this.handleEventsConfigChange({ [eventId]: config })
  };

  handleDefaultEventConfigReady = () => {
    const { defaultEventConfig } = this.state;
    const { wcif, competitorsByRound } = this.props;

    this.handleEventsConfigChange(
      wcif.events.reduce((configByEvent, wcifEvent) => {
        configByEvent[wcifEvent.id] = { ...defaultEventConfig, configByRound: {} };
        wcifEvent.rounds.forEach(round =>
          configByEvent[wcifEvent.id].configByRound[round.id] = {
            groups: suggestedGroupCount(competitorsByRound[round.id].length, wcifEvent.Id, defaultEventConfig.stations, 2),
            separateGroups: null
          }
        )
        return configByEvent;
      }, {})
    );
  };

  handleEventsConfigChange(eventsConfig) {
    const { wcif } = this.props;
    this.props.onWcifChange(
      mergeIn(wcif, ['extensions', 'Groupifier', 'configByEvent'], eventsConfig)
    );
  }

  render() {
    const { wcif, competitorsByRound } = this.props;
    const { defaultEventConfig } = this.state;

    const configByEvent = wcif.extensions['Groupifier'].configByEvent;

    return configByEvent ? (
      <div>
        {wcif.events.map(wcifEvent =>
          <ExpansionPanel key={wcifEvent.id}>
            <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
              <Typography variant="subheading">
                {Events.nameById(wcifEvent.id)}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <EventConfig
                eventId={wcifEvent.id}
                wcifEvents={wcif.events}
                competitorsByRound={competitorsByRound}
                config={configByEvent[wcifEvent.id]}
                onChange={this.handleEventConfigChange}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        )}
      </div>
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
