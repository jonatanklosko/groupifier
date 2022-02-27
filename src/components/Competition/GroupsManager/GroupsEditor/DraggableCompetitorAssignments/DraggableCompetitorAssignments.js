import React from 'react';
import DraggableCompetitor from '../DraggableCompetitor/DraggableCompetitor';

import { parseActivityCode } from '../../../../../logic/activities';
import { bestAverageAndSingle } from '../../../../../logic/competitors';
import { sortByArray } from '../../../../../logic/utils';
import { toAssignmentKey } from '../../../../../logic/assignments';

const DraggableCompetitorAssignments = React.memo(
  ({ people, assignmentCode, groupActivity }) => {
    const { eventId } = parseActivityCode(groupActivity.activityCode);

    const sortedPeople = sortByArray(people, person => [
      ...bestAverageAndSingle(person, eventId).map(result => -result),
      person.name,
    ]);

    return sortedPeople.map((person, index) => {
      const assignment = person.assignments.find(
        assignment =>
          assignment.activityId === groupActivity.id &&
          assignment.assignmentCode === assignmentCode
      );
      return (
        <DraggableCompetitor
          key={person.wcaUserId}
          person={person}
          draggableId={`${person.registrantId}:${toAssignmentKey(assignment)}`}
          index={index}
          averageLabelEventId={eventId}
        />
      );
    });
  }
);

export default DraggableCompetitorAssignments;
