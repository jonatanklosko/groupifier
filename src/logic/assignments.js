export const COMPETITOR_ASSIGNMENT_CODE = 'competitor';
export const SCRAMBLER_ASSIGNMENT_CODE = 'staff-scrambler';
export const RUNNER_ASSIGNMENT_CODE = 'staff-runner';
export const JUDGE_ASSIGNMENT_CODE = 'staff-judge';

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
