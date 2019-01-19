import { Competition, Person, PersonalBest, Event, Round, Result } from './wcif-builders';
import { competitorsForRound, advancingResults } from '../competitors';

describe('competitorsForRound', () => {
  const person1 = Person({
    registration: { eventIds: ['333', '222'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 2 }),
      PersonalBest({ eventId: '333', type: 'average', worldRanking: 2 })
    ]
  });
  const person2 = Person({
    registration: { eventIds: ['333'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 3 }),
      PersonalBest({ eventId: '333', type: 'average', worldRanking: 2 })
    ]
  });
  const personWithoutAverage = Person({
    registration: { eventIds: ['333'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 1 })
    ]
  });
  const personWithoutResults = Person({
    registration: { eventIds: ['333'] }
  });
  const personNotRegistered = Person({
    registration: { eventIds: ['222'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 1 }),
      PersonalBest({ eventId: '333', type: 'average', worldRanking: 1 })
    ]
  });
  const personNotAccepted = Person({
    registration: { eventIds: ['333'], status: 'pending' }
  });

  describe('when given a first round', () => {
    test('returns people ordered by official average then single descending', () => {
      const wcif = Competition({ persons: [person1, personWithoutAverage, personWithoutResults, person2] });
      expect(competitorsForRound(wcif, '333-r1')).toEqual(
        [personWithoutResults, personWithoutAverage, person2, person1]
      );
    });

    test('returns only people who registered for the given event', () => {
      const wcif = Competition({ persons: [person1, personNotRegistered] });
      expect(competitorsForRound(wcif, '333-r1')).toEqual([person1]);
    });

    test('returns only people with accepted registration', () => {
      const wcif = Competition({ persons: [person1, personNotAccepted] });
      expect(competitorsForRound(wcif, '333-r1')).toEqual([person1]);
    });
  });

  describe('when given a subsequent round', () => {
    const events = [
      Event({
        id: '333',
        rounds: [
          Round({
            id: '333-r1',
            results: [
              Result({ ranking: 1, personId: person2.registrantId }),
              Result({ ranking: 2, personId: personWithoutResults.registrantId }),
              Result({ ranking: 3, personId: person1.registrantId  }),
              Result({ ranking: 4, personId: personWithoutAverage.registrantId })
            ],
            advancementCondition: { type: 'ranking', level: 3 }
          }),
          Round({ id: '333-r2' })
        ]
      })
    ];
    test('returns advancing people ordered by previous round ranking descending', () => {
      const wcif = Competition({
        persons: [person1, personWithoutAverage, personWithoutResults, person2],
        events
      });
      expect(competitorsForRound(wcif, '333-r2')).toEqual([person1, personWithoutResults, person2]);
    });
  });
});

describe('advancingResults', () => {
  test('returns results satisfying the given advancement condition', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2 }),
      Result({ ranking: 3, personId: 3 }),
      Result({ ranking: 4, personId: 4 }),
      Result({ ranking: 5, personId: 5 })
    ];
    const advancementCondition = { type: 'ranking', level: 3 };
    expect(advancingResults(results, advancementCondition)).toEqual(results.slice(0, 3));
  });
  test('does not return more than 75% results in case of ties', () => {
    const results = [
      Result({ ranking: 1, personId: 1 }),
      Result({ ranking: 2, personId: 2 }),
      Result({ ranking: 3, personId: 3 }),
      Result({ ranking: 3, personId: 4 }),
      Result({ ranking: 5, personId: 5 })
    ];
    const advancementCondition = { type: 'percent', level: 75 };
    expect(advancingResults(results, advancementCondition)).toEqual(results.slice(0, 2));
  });

  test('does not treat DNF results as satisfying attemptResult advancement condition', () => {
    const results = [
      Result({ ranking: 1, personId: 1, attempts: [{ result: 2000 }, { result: 1000 }, { result: -1 }, { result: 5000 }, { result: -2 }] }),
      Result({ ranking: 2, personId: 2, attempts: [{ result: 1500 }, { result: 2000 }, { result: -1 }, { result: 5000 }, { result: 4000 }] }),
    ];
    const advancementCondition = { type: 'attemptResult', level: 1500 };
    expect(advancingResults(results, advancementCondition)).toEqual(results.slice(0, 1));
  });
});
