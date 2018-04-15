import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';

import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import Icon from 'material-ui/Icon';

import Events from '../../../logic/Events';

import EventConfig from './EventConfig/EventConfig';

export default class ConfigManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localWcif: props.wcif,
      tabValue: 0,
      defaultEventConfig: {
        stations: null,
        scramblers: null,
        runners: null,
        generateJudges: true
      },
      configByEvent: null
    }
  }

  handleDefaultEventConfigChange(config) {
    this.setState({ defaultEventConfig: config });
  }

  handleEventConfigChange(eventId, config) {
    this.setState({
      configByEvent: {
        ...this.state.configByEvent,
        [eventId]: config
      }
    });
  }

  handleTabChange(event, value) {
    this.setState({ tabValue: value });
  }

  handleDefaultEventConfigReady() {
    const { localWcif, defaultEventConfig } = this.state;
    this.setState({
      configByEvent:
        localWcif.events.reduce((configByEvent, wcifEvent) => (
          Object.assign(configByEvent, { [wcifEvent.id]: Object.assign({}, defaultEventConfig) })
        ), {})
    });
  }

  render() {
    const { defaultEventConfig, tabValue, localWcif, configByEvent } = this.state;
    const { onWcifUpdate } = this.props;

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          <AppBar position="static" color="default">
            <Tabs value={tabValue} onChange={this.handleTabChange.bind(this)} centered>
              <Tab label="Events" />
              <Tab label="General" />
            </Tabs>
          </AppBar>
        </Grid>
        {tabValue === 0 && (
          <Grid item xs={12}>
            {configByEvent ? (
              <div>
                {localWcif.events.map(wcifEvent =>
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
            )}
          </Grid>
        )}
        {tabValue === 1 && (
          <Grid item xs={12}>
            <Paper>
              <Typography>General settings</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item>
          <Button variant="raised" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="raised"
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
