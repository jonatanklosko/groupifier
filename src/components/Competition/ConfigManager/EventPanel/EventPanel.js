import React, { PureComponent } from 'react';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import Grid from 'material-ui/Grid';
import Icon from 'material-ui/Icon';
import Typography from 'material-ui/Typography';

import EventConfig from '../EventConfig/EventConfig';
import Events from '../../../../logic/Events';
import RoundConfig from '../RoundConfig/RoundConfig';
import { getGroupifierData, setGroupifierData } from '../../../../logic/wcifExtensions';

export default class EventPanel extends PureComponent {
  constructor(props) {
    super(props);

    const { wcifEvent, wcifEvents } = props;
    this.roundIds = wcifEvents
      .filter(_wcifEvent => _wcifEvent.id !== wcifEvent.id)
      .reduce((roundIds, wcifEvent) =>
        roundIds.concat(wcifEvent.rounds.map(round => round.id))
      , []);
  }

  handleRoundChange = updatedRound => {
    const { wcifEvent, onChange } = this.props;
    onChange({
      ...wcifEvent,
      rounds: wcifEvent.rounds.map(round => round.id === updatedRound.id ? updatedRound : round)
    });
  };

  handleEventConfigChange = config => {
    const { wcifEvent, onChange } = this.props;
    onChange(setGroupifierData('Event', wcifEvent, config));
  };

  render() {
    const { wcifEvent, competitorsByRound } = this.props;

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <Typography variant="subheading">
            {Events.nameById(wcifEvent.id)}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container>
            <Grid item xs={12} md={6}>
              <EventConfig
                config={getGroupifierData(wcifEvent)}
                onChange={this.handleEventConfigChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container direction="column" spacing={16}>
                {wcifEvent.rounds.map((round, index) =>
                  <Grid item key={round.id}>
                    <RoundConfig
                      round={round}
                      roundIds={this.roundIds}
                      competitorsByRound={competitorsByRound}
                      onChange={this.handleRoundChange}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
