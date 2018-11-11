import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

import { activityCodeToName } from '../../../../logic/activities';

export default class RoundWithGroups extends Component {
  handlePanelChange = (event, expanded) => {
    const { onChange, roundId } = this.props;
    onChange(expanded ? roundId : null);
  };

  scrollToElement = node => {
    /* Node is the panel content, so the panel is its parent. */
    window.scrollTo({
      top: node.parentNode.getBoundingClientRect().top - 8,
      behavior: 'smooth'
    });
  };

  render() {
    const { expanded, roundId, render } = this.props;

    return (
      <ExpansionPanel
        onChange={this.handlePanelChange}
        expanded={expanded}
        CollapseProps={{ onEntered: this.scrollToElement }}
      >
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <Typography variant="subtitle1">
            {activityCodeToName(roundId)}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {expanded && render(roundId)}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
