import { parseActivityCode, activityCodeToName } from './activities';
import { personById, roundById, previousRound } from './wcif';
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
  return personalBest ? personalBest.best : Infinity;
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
  advancementCondition,
  eventId
) => {
  switch (advancementCondition.type) {
    case 'ranking':
      return sortedCompetitors.slice(0, advancementCondition.level);
    case 'percent':
      return sortedCompetitors.slice(
        0,
        Math.floor(sortedCompetitors.length * advancementCondition.level * 0.01)
      );
    case 'attemptResult':
      /* Assume that competitors having personal best better than the advancement condition will make it to the next round. */
      return sortedCompetitors.filter(
        person => best(person, eventId, 'single') < advancementCondition.level
      );
    default:
      throw new Error(
        `Unrecognised AdvancementCondition type: '${advancementCondition.type}'`
      );
  }
};

export const getExpectedCompetitorsByRound = wcif =>
  wcif.events.reduce((expectedCompetitorsByRound, event) => {
    const [firstRound, ...nextRounds] = event.rounds;
    expectedCompetitorsByRound[
      firstRound.id
    ] = sortByArray(
      acceptedPeopleRegisteredForEvent(wcif, event.id),
      competitor => bestAverageAndSingle(competitor, event.id)
    );
    nextRounds.reduce(
      ([round, competitors], nextRound) => {
        const advancementCondition = round.advancementCondition;
        if (!advancementCondition) {
          throw new Error(
            `Mising advancement condition for ${activityCodeToName(round.id)}.`
          );
        }
        const nextRoundCompetitors = competitorsExpectedToAdvance(
          competitors,
          advancementCondition,
          event.id
        );
        expectedCompetitorsByRound[nextRound.id] = nextRoundCompetitors;
        return [nextRound, nextRoundCompetitors];
      },
      [firstRound, expectedCompetitorsByRound[firstRound.id]]
    );
    return expectedCompetitorsByRound;
  }, {});

/* Returns competitors for the given round sorted from worst to best. */
export const competitorsForRound = (wcif, roundId) => {
  const { eventId, roundNumber } = parseActivityCode(roundId);
  const round = roundById(wcif, roundId);
  const competitorsInRound = round.results.map(({ personId }) =>
    personById(wcif, personId)
  );
  if (roundNumber === 1) {
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
    const previous = previousRound(wcif, roundId);
    return sortBy(competitorsInRound, person => {
      const previousResult = previous.results.find(
        result => result.personId === person.registrantId
      );
      return -previousResult.ranking;
    });
  } else {
    return null;
  }
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
