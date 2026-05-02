import {
  Competition,
  Event,
  Round,
  Venue,
  Room,
  Activity,
  Person,
} from './wcif-builders';
import { setExtensionData } from '../wcif-extensions';
import { scorecards } from '../documents/scorecards';

describe('scorecards', () => {
  test('uses assigned competitors for later rounds even when round results are empty', () => {
    const round2Group = Activity({ activityCode: 'clock-r2-g1' });
    const competitor = Person({
      name: 'Clock Competitor',
      registration: { eventIds: ['clock'] },
      assignments: [
        {
          activityId: round2Group.id,
          assignmentCode: 'competitor',
          stationNumber: 1,
        },
      ],
    });
    const wcif = setExtensionData(
      'CompetitionConfig',
      Competition({
        shortName: 'Example 2019',
        events: [
          Event({
            id: 'clock',
            rounds: [Round({ id: 'clock-r1' }), Round({ id: 'clock-r2' })],
          }),
        ],
        persons: [competitor],
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
      }),
      {
        localNamesFirst: false,
        printOneName: false,
        printStations: true,
        scorecardPaperSize: 'a4',
        scorecardOrder: 'natural',
        printScorecardsCoverSheets: false,
      }
    );

    const cards = scorecards(
      wcif,
      [wcif.events[0].rounds[1]],
      [wcif.schedule.venues[0].rooms[0]],
      'en'
    );

    expect(JSON.stringify(cards)).toContain('Clock Competitor');
  });
});
