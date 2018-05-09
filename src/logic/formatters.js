import Events from './Events';

export const parseRoundId = roundId => {
  const [, eventId, roundNumber] = roundId.match(/(\w+)-r(\d+)/);
  return { eventId, roundNumber };
};

export const roundIdToName = roundId => {
  const { eventId, roundNumber } = parseRoundId(roundId);
  return `${Events.nameById(eventId)} Round ${roundNumber}`;
};

export const roundIdToShortName = roundId => {
  return `Round ${parseRoundId(roundId).roundNumber}`;
};
