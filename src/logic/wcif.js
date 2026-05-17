import { parseActivityCode } from './activities';

export const eventById = (wcif, eventId) => {
  return wcif.events.find(event => event.id === eventId);
};

export const personById = (wcif, personId) => {
  return wcif.persons.find(person => person.registrantId === personId);
};

export const roundById = (wcif, roundId) => {
  const { eventId } = parseActivityCode(roundId);
  return eventById(wcif, eventId).rounds.find(round => round.id === roundId);
};

export const previousRound = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  const event = eventById(wcif, eventId);
  return event.rounds.find(
    ({ id }) => parseActivityCode(id).roundNumber === roundNumber - 1
  );
};

export const participationSourceRounds = (wcif, participationSource) => {
  if (participationSource.type === 'registrations') {
    return [];
  }
  if (participationSource.type === 'round') {
    return [roundById(wcif, participationSource.roundId)];
  }
  if (participationSource.type === 'linkedRounds') {
    return participationSource.roundIds.map(roundId => {
      return roundById(wcif, roundId);
    });
  }

  throw new Error(
    'unknown participation source type:',
    participationSource.type
  );
};
