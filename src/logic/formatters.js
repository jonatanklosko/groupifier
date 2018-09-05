import { eventNameById } from './events';
import { parseActivityCode } from './activities';

export const roundIdToName = roundId => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  return `${eventNameById(eventId)} Round ${roundNumber}`;
};

export const roundIdToShortName = roundId => {
  return `Round ${parseActivityCode(roundId).roundNumber}`;
};
