import React, { Component } from 'react';
import Button from 'material-ui/Button';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import Icon from 'material-ui/Icon';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import Events from '../../../../logic/Events';

import EventConfig from '../EventConfig/EventConfig';

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

  handleDefaultEventConfigChange(config) {
    this.setState({ defaultEventConfig: config });
  }

  handleEventConfigChange(eventId, config) {
    this.props.onConfigByEventChange({
      ...this.props.configByEvent,
      [eventId]: config
    });
  }

  handleDefaultEventConfigReady() {
    const { defaultEventConfig } = this.state;
    const { wcif } = this.props;

    this.props.onConfigByEventChange(
      wcif.events.reduce((configByEvent, wcifEvent) => (
        Object.assign(configByEvent, { [wcifEvent.id]: Object.assign({}, defaultEventConfig) })
      ), {})
    );
  }

  render() {
    const { onConfigByEventChange, configByEvent, wcif } = this.props;
    const { defaultEventConfig } = this.state;

    return configByEvent ? (
      <div>
        {wcif.events.map(wcifEvent =>
          <ExpansionPanel key={wcifEvent.id}>
            <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
              <Typography variant="subheading">{Events.nameById(wcifEvent.id)}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <EventConfig config={configByEvent[wcifEvent.id]} onChange={this.handleEventConfigChange.bind(this, wcifEvent.id)} />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        )}
      </div>
    ) : (
      <Paper style={{ padding: 16 }}>
        <Typography variant="headline">Default configuration</Typography>
        <EventConfig config={defaultEventConfig} onChange={this.handleDefaultEventConfigChange.bind(this)} />
        <Button
          onClick={this.handleDefaultEventConfigReady.bind(this)}
          disabled={Object.values(defaultEventConfig).some(value => value === null)}
        >
          Ready
        </Button>
      </Paper>
    );
  }
}
