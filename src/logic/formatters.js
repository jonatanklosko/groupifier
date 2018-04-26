import Events from './Events';

export const roundIdToName = roundId => {
  const [, eventId, roundNumber] = roundId.match(/(\w+)-r(\d+)/);
  return `${Events.nameById(eventId)} Round ${roundNumber}`;
}
