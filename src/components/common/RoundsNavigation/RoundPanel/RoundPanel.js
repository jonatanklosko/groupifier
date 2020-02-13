import React, { Fragment } from 'react';
import Divider from '@material-ui/core/Divider';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';

import { activityCodeToName } from '../../../../logic/activities';

const RoundPanel = ({
  expanded,
  onChange,
  roundId,
  render,
  renderActions = null,
}) => {
  const scrollToElement = node => {
    /* Node is the panel content, so the panel is its parent. */
    window.scrollTo({
      top: node.parentNode.getBoundingClientRect().top - 8,
      behavior: 'smooth',
    });
  };

  const actions = renderActions && renderActions(roundId);

  return (
    <ExpansionPanel
      onChange={(event, expanded) => onChange(expanded ? roundId : null)}
      expanded={expanded}
      TransitionProps={{ onEntered: scrollToElement }}
    >
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">
          {activityCodeToName(roundId)}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {expanded && render(roundId)}
      </ExpansionPanelDetails>
      {actions && (
        <Fragment>
          <Divider />
          <ExpansionPanelActions>{actions}</ExpansionPanelActions>
        </Fragment>
      )}
    </ExpansionPanel>
  );
};

export default RoundPanel;
