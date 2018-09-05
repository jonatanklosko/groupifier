import Events from './Events';
import { parseActivityCode } from './activities';

export const roundIdToName = roundId => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  return `${Events.nameById(eventId)} Round ${roundNumber}`;
};

export const roundIdToShortName = roundId => {
  return `Round ${parseActivityCode(roundId).roundNumber}`;
};
