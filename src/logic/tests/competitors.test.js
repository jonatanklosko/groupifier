import { Competition, Person, PersonalBest } from './wcif-builders';
import { competitorsForRound } from '../competitors';

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
});
