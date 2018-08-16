import React, { PureComponent } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

import Events from '../../../../logic/Events';
import RoundConfig from '../RoundConfig/RoundConfig';
import { setGroupifierData } from '../../../../logic/wcifExtensions';

export default class EventPanel extends PureComponent {
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
    const { wcifEvent, wcif, expectedCompetitorsByRound, onWcifChange } = this.props;

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <Typography variant="subheading">
            {Events.nameById(wcifEvent.id)}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction="column" spacing={16}>
            {wcifEvent.rounds.map((round, index) =>
              <Grid item key={round.id}>
                <RoundConfig
                  round={round}
                  wcif={wcif}
                  otherEventsRoundIds={this.otherEventsRoundIds}
                  expectedCompetitorsByRound={expectedCompetitorsByRound}
                  onWcifChange={onWcifChange}
                />
              </Grid>
            )}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
