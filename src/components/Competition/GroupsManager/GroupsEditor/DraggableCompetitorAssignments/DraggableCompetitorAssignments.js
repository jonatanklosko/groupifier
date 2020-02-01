import React from 'react';
import DraggableCompetitor from '../DraggableCompetitor/DraggableCompetitor';

import { parseActivityCode } from '../../../../../logic/activities';
import { bestAverageAndSingle } from '../../../../../logic/competitors';
import { sortByArray } from '../../../../../logic/utils';

const DraggableCompetitorAssignments = React.memo(
  ({ people, role, groupActivity }) => {
    const { eventId } = parseActivityCode(groupActivity.activityCode);

    const sortedPeople = sortByArray(people, person => [
      ...bestAverageAndSingle(person, eventId).map(result => -result),
      person.name,
    ]);

    return sortedPeople.map((person, index) => {
      const assignmentIndex = person.assignments.findIndex(
        assignment =>
          assignment.activityId === groupActivity.id &&
          assignment.assignmentCode === role.id
      );
      return (
        <DraggableCompetitor
          key={person.wcaUserId}
          person={person}
          draggableId={`${person.registrantId}:${assignmentIndex}`}
          index={index}
          averageLabelEventId={eventId}
        />
      );
    });
  }
);

export default DraggableCompetitorAssignments;
