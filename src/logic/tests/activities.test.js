import {
  Competition,
  Event,
  Round,
  Venue,
  Room,
  Activity,
  Person,
} from './wcif-builders';
import { roundsMissingScorecards } from '../activities';

describe('roundsMissingScorecards', () => {
  test('includes assigned later rounds even when their results are still empty', () => {
    const round2Group = Activity({ activityCode: 'clock-r2-g1' });
    const wcif = Competition({
      events: [
        Event({
          id: 'clock',
          rounds: [
            Round({ id: 'clock-r1' }),
            Round({ id: 'clock-r2', results: [] }),
          ],
        }),
      ],
      persons: [
        Person({
          registration: { eventIds: ['clock'] },
          assignments: [
            {
              activityId: round2Group.id,
              assignmentCode: 'competitor',
              stationNumber: 1,
            },
          ],
        }),
      ],
      schedule: {
        venues: [
          Venue({
            rooms: [
              Room({
                activities: [
                  Activity({
                    activityCode: 'clock-r2',
                    childActivities: [round2Group],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    });

    expect(roundsMissingScorecards(wcif).map(round => round.id)).toContain(
      'clock-r2'
    );
  });
});
