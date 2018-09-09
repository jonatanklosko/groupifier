import { parseActivityCode } from './activities';

export const roundIdToShortName = roundId => {
  return `Round ${parseActivityCode(roundId).roundNumber}`;
};
