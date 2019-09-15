import {
  Competition,
  Event,
  Round,
  Venue,
  Room,
  Activity,
} from './wcif-builders';
import { validateWcif } from '../wcif-validation';

describe('validateWcif', () => {
  test('returns an error when an even has no rounds', () => {
    const wcif = Competition({ events: [Event({ id: '333', rounds: [] })] });
    expect(validateWcif(wcif)).toContain('No rounds specified for 3x3x3 Cube.');
  });

  test('returns an error when a round has no advancement condition unless it is the last one', () => {
    const wcif = Competition({
      events: [
        Event({
          id: '333',
          rounds: [
            Round({ id: '333-r1', advancementCondition: null }),
            Round({ id: '333-r2', advancementCondition: null }),
          ],
        }),
      ],
    });
    expect(validateWcif(wcif)).toContain(
      'No advancement condition specified for 3x3x3 Cube, Round 1.'
    );
    expect(validateWcif(wcif)).not.toContain(
      'No advancement condition specified for 3x3x3 Cube, Round 2.'
    );
  });

  test('returns an error when schedule does not include a round', () => {
    const wcif = Competition({
      events: [
        Event({
          id: '333',
          rounds: [Round({ id: '333-r1' }), Round({ id: '333-r2' })],
        }),
      ],
      schedule: {
        venues: [
          Venue({
            rooms: [
              Room({ activities: [Activity({ activityCode: '333-r1' })] }),
            ],
          }),
        ],
      },
    });
    expect(validateWcif(wcif)).toContain(
      'No schedule activities for 3x3x3 Cube, Round 2.'
    );
    expect(validateWcif(wcif)).not.toContain(
      'No schedule activities for 3x3x3 Cube, Round 1.'
    );
  });
});
