import React, { PureComponent } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

import { eventNameById } from '../../../../logic/events';
import RoundConfig from '../RoundConfig/RoundConfig';

export default class EventPanel extends PureComponent {
  render() {
    const { wcifEvent, wcif, expectedCompetitorsByRound, onWcifChange } = this.props;

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <Typography variant="subheading">
            {eventNameById(wcifEvent.id)}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction="column" spacing={16}>
            {wcifEvent.rounds.map(round =>
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
