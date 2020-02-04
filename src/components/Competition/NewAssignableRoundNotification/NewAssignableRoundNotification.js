import React from 'react';
import Button from '@material-ui/core/Button';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import pink from '@material-ui/core/colors/pink';

import {
  roundsMissingAssignments,
  activityCodeToName,
} from '../../../logic/activities';
import { anyCompetitorAssignment } from '../../../logic/assignments';
import { assignTasks } from '../../../logic/groups';
import { downloadScorecards } from '../../../logic/documents/scorecards';
import { saveWcifChanges } from '../../../logic/wca-api';

const NewAssignableRoundNotification = ({ wcif, onWcifUpdate }) => {
  /* Don't show the notification if there are no assignments at all. */
  const newRoundsToAssign = anyCompetitorAssignment(wcif)
    ? roundsMissingAssignments(wcif)
    : [];

  const newRoundsToAssignNames = newRoundsToAssign.map(round =>
    activityCodeToName(round.id)
  );

  const handleActionClick = () => {
    const updatedWcif = assignTasks(wcif);
    /* Just make the request in the background. */
    saveWcifChanges(wcif, updatedWcif);
    downloadScorecards(updatedWcif, newRoundsToAssign);
    onWcifUpdate(updatedWcif);
  };

  if (newRoundsToAssign.length === 0) return null;

  return (
    <SnackbarContent
      message={`
        Assign tasks and print scorecards for
        ${newRoundsToAssignNames.join(', ')}.
      `}
      action={
        <Button
          onClick={handleActionClick}
          style={{ color: pink[500] }}
          size="small"
        >
          Yessir!
        </Button>
      }
    />
  );
};

export default NewAssignableRoundNotification;
