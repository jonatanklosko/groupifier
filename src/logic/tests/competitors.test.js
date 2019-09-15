import {
  Competition,
  Person,
  PersonalBest,
  Event,
  Round,
  Result,
} from './wcif-builders';
import { competitorsForRound } from '../competitors';

describe('competitorsForRound', () => {
  const person1 = Person({
    registration: { eventIds: ['333', '222'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 2 }),
      PersonalBest({ eventId: '333', type: 'average', worldRanking: 2 }),
    ],
  });
  const person2 = Person({
    registration: { eventIds: ['333'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 3 }),
      PersonalBest({ eventId: '333', type: 'average', worldRanking: 2 }),
    ],
  });
  const personWithoutAverage = Person({
    registration: { eventIds: ['333'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 1 }),
    ],
  });
  const personWithoutPersonalBests = Person({
    registration: { eventIds: ['333'] },
  });
  const personNotRegistered = Person({
    registration: { eventIds: ['222'] },
    personalBests: [
      PersonalBest({ eventId: '333', type: 'single', worldRanking: 1 }),
      PersonalBest({ eventId: '333', type: 'average', worldRanking: 1 }),
    ],
  });
  const personNotAccepted = Person({
    registration: { eventIds: ['333'], status: 'pending' },
  });

  describe('when given a first round', () => {
    describe('when has no results', () => {
      const events = [
        Event({
          id: '333',
          rounds: [
            Round({ id: '333-r1', results: [] }),
            Round({ id: '333-r2' }),
          ],
        }),
      ];

      test('returns people ordered by official average then single descending', () => {
        const wcif = Competition({
          events,
          persons: [
            person1,
            personWithoutAverage,
            personWithoutPersonalBests,
            person2,
          ],
        });
        expect(competitorsForRound(wcif, '333-r1')).toEqual([
          personWithoutPersonalBests,
          personWithoutAverage,
          person2,
          person1,
        ]);
      });

      test('returns only people who registered for the given event', () => {
        const wcif = Competition({
          events,
          persons: [person1, personNotRegistered],
        });
        expect(competitorsForRound(wcif, '333-r1')).toEqual([person1]);
      });

      test('returns only people with accepted registration', () => {
        const wcif = Competition({
          events,
          persons: [person1, personNotAccepted],
        });
        expect(competitorsForRound(wcif, '333-r1')).toEqual([person1]);
      });
    });

    describe('when has results', () => {
      const events = [
        Event({
          id: '333',
          rounds: [
            Round({
              id: '333-r1',
              results: [
                Result({ attempts: [], personId: person1.registrantId }),
                Result({
                  attempts: [],
                  personId: personWithoutAverage.registrantId,
                }),
                Result({
                  attempts: [],
                  personId: personWithoutPersonalBests.registrantId,
                }),
              ],
            }),
            Round({ id: '333-r2' }),
          ],
        }),
      ];

      test('returns people ordered by official average then single descending', () => {
        const wcif = Competition({
          events,
          persons: [person1, personWithoutAverage, personWithoutPersonalBests],
        });
        expect(competitorsForRound(wcif, '333-r1')).toEqual([
          personWithoutPersonalBests,
          personWithoutAverage,
          person1,
        ]);
      });

      test('returns only people corresponding to the results', () => {
        const wcif = Competition({
          events,
          persons: [
            person2,
            person1,
            personWithoutAverage,
            personWithoutPersonalBests,
            personNotAccepted,
          ],
        });
        expect(competitorsForRound(wcif, '333-r1')).toEqual([
          personWithoutPersonalBests,
          personWithoutAverage,
          person1,
        ]);
      });
    });
  });

  describe('when given a subsequent round', () => {
    test('returns advancing people ordered by previous round ranking descending', () => {
      const events = [
        Event({
          id: '333',
          rounds: [
            Round({
              id: '333-r1',
              results: [
                Result({ ranking: 1, personId: person2.registrantId }),
                Result({
                  ranking: 2,
                  personId: personWithoutPersonalBests.registrantId,
                }),
                Result({ ranking: 3, personId: person1.registrantId }),
                Result({
                  ranking: 4,
                  personId: personWithoutAverage.registrantId,
                }),
              ],
            }),
            Round({
              id: '333-r2',
              results: [
                Result({ attempts: [], personId: person2.registrantId }),
                Result({
                  attempts: [],
                  personId: personWithoutPersonalBests.registrantId,
                }),
                Result({ attempts: [], personId: person1.registrantId }),
              ],
            }),
          ],
        }),
      ];
      const wcif = Competition({
        persons: [
          person1,
          personWithoutAverage,
          personWithoutPersonalBests,
          person2,
        ],
        events,
      });
      expect(competitorsForRound(wcif, '333-r2')).toEqual([
        person1,
        personWithoutPersonalBests,
        person2,
      ]);
    });
  });

  describe('when competitors for the given round cannot be determined yet', () => {
    test('returns null', () => {
      const wcif = Competition({
        persons: [person1, person2],
        events: [
          Event({ rounds: [Round({ id: '333-r1' }), Round({ id: '333-r2' })] }),
        ],
      });
      expect(competitorsForRound(wcif, '333-r2')).toEqual(null);
    });
  });
});
