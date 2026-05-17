import { parseActivityCode } from './activities';
import { personById, roundById, participationSourceRounds } from './wcif';
import { sortBy, sortByArray, uniq } from './utils';

export const best = (person, eventId, type) => {
  if (!['single', 'average'].includes(type)) {
    throw new Error(
      `Personal best type must be either 'single' or 'average'. Received '${type}'.`
    );
  }
  const personalBest = person.personalBests.find(
    pb => pb.eventId === eventId && pb.type === type
  );
  return personalBest ? personalBest.value : Infinity;
};

export const bestAverageAndSingle = (competitor, eventId) => {
  if (['333bf', '444bf', '555bf', '333mbf'].includes(eventId)) {
    return [
      best(competitor, eventId, 'single'),
      best(competitor, eventId, 'average'),
    ];
  } else {
    return [
      best(competitor, eventId, 'average'),
      best(competitor, eventId, 'single'),
    ];
  }
};

const competitorsExpectedToAdvance = (
  sortedCompetitors,
  resultCondition,
  eventId
) => {
  switch (resultCondition.type) {
    case 'ranking':
      return sortedCompetitors.slice(0, resultCondition.value);
    case 'percent':
      return sortedCompetitors.slice(
        0,
        Math.floor(sortedCompetitors.length * resultCondition.value * 0.01)
      );
    case 'resultAchieved':
      /* Assume competitors with a personal best better than the condition level will advance. */
      return sortedCompetitors.filter(person => {
        const pb = best(person, eventId, resultCondition.scope);
        return resultCondition.value === null
          ? pb !== Infinity
          : pb < resultCondition.value;
      });
    default:
      throw new Error(
        `Unrecognised ResultCondition type: '${resultCondition.type}'`
      );
  }
};

export const getExpectedCompetitorsByRound = wcif => {
  const expectedCompetitorsByRound = {};

  for (const event of wcif.events) {
    for (const round of event.rounds) {
      const source = round.participationRuleset.participationSource;
      if (source.type === 'registrations') {
        expectedCompetitorsByRound[
          round.id
        ] = sortByArray(
          acceptedPeopleRegisteredForEvent(wcif, event.id),
          competitor => bestAverageAndSingle(competitor, event.id)
        );
      } else if (source.type === 'round') {
        expectedCompetitorsByRound[round.id] = competitorsExpectedToAdvance(
          expectedCompetitorsByRound[source.roundId],
          source.resultCondition,
          event.id
        );
      } else if (source.type === 'linkedRounds') {
        const allCompetitors = uniq(
          source.roundIds.flatMap(
            roundId => expectedCompetitorsByRound[roundId]
          )
        );
        const sortedCompetitors = sortByArray(allCompetitors, competitor =>
          bestAverageAndSingle(competitor, event.id)
        );
        expectedCompetitorsByRound[round.id] = competitorsExpectedToAdvance(
          sortedCompetitors,
          source.resultCondition,
          event.id
        );
      } else {
        throw new Error(
          `Unrecognised ParticipationSource type: '${source.type}'`
        );
      }
    }
  }

  return expectedCompetitorsByRound;
};

/* Returns competitors for the given round sorted from worst to best. */
export const competitorsForRound = (wcif, roundId) => {
  const { eventId } = parseActivityCode(roundId);
  const round = roundById(wcif, roundId);
  const source = round.participationRuleset.participationSource;
  const competitorsInRound = round.results.map(({ personId }) =>
    personById(wcif, personId)
  );
  if (source.type === 'registrations') {
    /* For first rounds, if there are no empty results to use, get whoever registered for the given event. */
    const competitors =
      competitorsInRound.length > 0
        ? competitorsInRound
        : acceptedPeopleRegisteredForEvent(wcif, eventId);
    return sortByArray(competitors, competitor => [
      ...bestAverageAndSingle(competitor, eventId).map(result => -result),
      competitor.name,
    ]);
  } else if (competitorsInRound.length > 0) {
    // Sort competitors by the result they get in the previous round.
    // Note that in case of linked dual rounds, we need to look for
    // results in both rounds, since some competitors may have only
    // participated in one of them. The ranking should be the same
    // in both results, so we just use the first one we find.

    const previousRounds = participationSourceRounds(wcif, source);
    return sortBy(competitorsInRound, person => {
      const previousResult = findPersonResultInRounds(person, previousRounds);
      if (previousResult) {
        return -previousResult.ranking;
      }
      // We should always find a result above, but fallback to max ranking
      // just in case.
      return -competitorsInRound.length;
    });
  } else {
    return null;
  }
};

const findPersonResultInRounds = (person, rounds) => {
  for (const round of rounds) {
    const result = round.results.find(
      result => result.personId === person.registrantId
    );
    if (result) {
      return result;
    }
  }

  return null;
};

export const age = person => {
  const diffMs = Date.now() - new Date(person.birthdate).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.2425));
};

export const acceptedPeople = wcif =>
  wcif.persons.filter(
    person => person.registration && person.registration.status === 'accepted'
  );

const acceptedPeopleRegisteredForEvent = (wcif, eventId) =>
  acceptedPeople(wcif).filter(({ registration }) =>
    registration.eventIds.includes(eventId)
  );

export const isForeigner = (wcif, competitor) => {
  const competitionCountryIso2 = competitionCountryIso2s(wcif)[0];
  return competitor.countryIso2 !== competitionCountryIso2;
};

const competitionCountryIso2s = wcif => {
  const iso2s = wcif.schedule.venues.map(venue => venue.countryIso2);
  return uniq(iso2s);
};
