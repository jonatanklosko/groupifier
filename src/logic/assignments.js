import {
  parseActivityCode,
  activityById,
  activitiesOverlap,
  activityCodeToGroupName,
  sameRoundActivityCode,
} from './activities';

export const COMPETITOR_ASSIGNMENT_CODE = 'competitor';
export const SCRAMBLER_ASSIGNMENT_CODE = 'staff-scrambler';
export const RUNNER_ASSIGNMENT_CODE = 'staff-runner';
export const JUDGE_ASSIGNMENT_CODE = 'staff-judge';
export const DELEGATE_ROLE = 'delegate';
export const TRAINEE_DELEGATE_ROLE = 'trainee-delegate';
export const ORGANIZER_ROLE = 'organizer';
export const DATA_ENTRY_ROLE = 'staff-dataentry';
export const OTHER_ROLE = 'staff-other';

export const assignmentCodes = [
  COMPETITOR_ASSIGNMENT_CODE,
  SCRAMBLER_ASSIGNMENT_CODE,
  RUNNER_ASSIGNMENT_CODE,
  JUDGE_ASSIGNMENT_CODE,
];

export const assignmentName = assignmentCode => {
  switch (assignmentCode) {
    case COMPETITOR_ASSIGNMENT_CODE:
      return 'Competitor';
    case SCRAMBLER_ASSIGNMENT_CODE:
      return 'Scrambler';
    case RUNNER_ASSIGNMENT_CODE:
      return 'Runner';
    case JUDGE_ASSIGNMENT_CODE:
      return 'Judge';
    default:
      throw new Error(`Unrecognised assignment code: '${assignmentCode}'`);
  }
};

export const roleName = role => {
  switch (role) {
    case DELEGATE_ROLE:
      return 'Delegate';
    case TRAINEE_DELEGATE_ROLE:
      return 'Trainee Delegate';
    case ORGANIZER_ROLE:
      return 'Organizer';
    case DATA_ENTRY_ROLE:
      return 'Data Entry';
    case OTHER_ROLE:
      return 'Other Staff';
    default:
      //The rest of the roles are the same as assignment codes
      return assignmentName(role);
  }
};

export const anyCompetitorAssignment = wcif => {
  return wcif.persons.some(person =>
    person.assignments.some(
      assignment => assignment.assignmentCode === COMPETITOR_ASSIGNMENT_CODE
    )
  );
};

const isStaffAssignment = assignmentCode => {
  return assignmentCode.startsWith('staff-');
};

export const staffAssignments = person => {
  return person.assignments.filter(({ assignmentCode }) =>
    isStaffAssignment(assignmentCode)
  );
};

export const staffAssignmentsForEvent = (wcif, person, eventId) => {
  return staffAssignments(person).filter(({ activityId }) => {
    const { activityCode } = activityById(wcif, activityId);
    return parseActivityCode(activityCode).eventId === eventId;
  });
};

export const hasAssignment = (person, activityId, assignmentCode) => {
  return person.assignments.some(
    assignment =>
      assignment.activityId === activityId &&
      assignment.assignmentCode === assignmentCode
  );
};

export const getAssignment = (person, activityId, assignmentCode) => {
  return person.assignments.find(
    assignment =>
      assignment.activityId === activityId &&
      assignment.assignmentCode === assignmentCode
  );
};

export const updateAssignments = (wcif, personId, updateFn) => {
  return {
    ...wcif,
    persons: wcif.persons.map(person =>
      person.registrantId === personId
        ? {
            ...person,
            assignments: updateFn(person.assignments),
          }
        : person
    ),
  };
};

export const newAssignmentError = (wcif, assignments, newAssignment) => {
  const newActivity = activityById(wcif, newAssignment.activityId);
  const overlappingActivity = assignments
    .map(assignment => activityById(wcif, assignment.activityId))
    .find(assignedActivity => activitiesOverlap(assignedActivity, newActivity));
  if (overlappingActivity) {
    return `Has an overlapping assignment for
      ${activityCodeToGroupName(overlappingActivity.activityCode)}
      during that time.
    `;
  }
  if (newAssignment.assignmentCode === COMPETITOR_ASSIGNMENT_CODE) {
    const activityWhereCompetes = assignments
      .filter(
        assignment => assignment.assignmentCode === COMPETITOR_ASSIGNMENT_CODE
      )
      .map(assignment => activityById(wcif, assignment.activityId))
      .find(assignedActivity =>
        sameRoundActivityCode(
          assignedActivity.activityCode,
          newActivity.activityCode
        )
      );
    if (activityWhereCompetes) {
      return `Already has competitor assignment for
        ${activityCodeToGroupName(activityWhereCompetes.activityCode)}.
      `;
    }
  }
  return null;
};

// Returns an assignment identifier unique in the context of a single competitor
export const toAssignmentKey = assignment => {
  return `${assignment.activityId}-${assignment.activityCode}`;
};
