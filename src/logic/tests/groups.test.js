import {
  Competition,
  Event,
  Round,
  Venue,
  Room,
  Activity,
} from './wcif-builders';
import { createGroupActivities } from '../groups';
import { setExtensionData } from '../wcif-extensions';

describe('createGroupActivities', () => {
  test('does not create group activities for MBLD and FMC', () => {
    const activities = [
      Activity({ activityCode: '333mbf-r1-a1' }),
      Activity({ activityCode: '333fm-r1-a1' }),
    ];
    const wcif = Competition({
      events: [
        Event({ id: '333mbf', rounds: [Round({ id: '333mbf-r1' })] }),
        Event({ id: '333fm', rounds: [Round({ id: '333fm-r1' })] }),
      ],
      schedule: {
        venues: [Venue({ rooms: [Room({ activities })] })],
      },
    });
    expect(createGroupActivities(wcif)).toEqual(wcif);
  });

  test('does not create group activities if there are any already', () => {
    const roundActivity = setExtensionData(
      'ActivityConfig',
      Activity({
        activityCode: '333-r1',
        startTime: '2020-01-01T10:00:00.000Z',
        endTime: '2020-01-01T11:00:00.000Z',
        childActivities: [Activity({ activityCode: '333-r1-g1' })],
      }),
      { groups: 4 }
    );
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [Round({ id: '333-r1' })] })],
      schedule: {
        venues: [Venue({ rooms: [Room({ activities: [roundActivity] })] })],
      },
    });
    expect(createGroupActivities(wcif)).toEqual(wcif);
  });

  test('creates child group activities for round activities according to the configuration', () => {
    const roundActivity = setExtensionData(
      'ActivityConfig',
      Activity({
        activityCode: '333-r1',
        startTime: '2020-01-01T10:00:00.000Z',
        endTime: '2020-01-01T11:00:00.000Z',
      }),
      { groups: 4 }
    );
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [Round({ id: '333-r1' })] })],
      schedule: {
        venues: [Venue({ rooms: [Room({ activities: [roundActivity] })] })],
      },
    });
    const updatedActivity = createGroupActivities(wcif).schedule.venues[0]
      .rooms[0].activities[0];
    expect(updatedActivity.childActivities).toHaveLength(4);
    const [
      firstGroup,
      secondGroup,
      thirdGroup,
      fourthGroup,
    ] = updatedActivity.childActivities;
    expect(firstGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g1',
        startTime: '2020-01-01T10:00:00.000Z',
        endTime: '2020-01-01T10:15:00.000Z',
      })
    );
    expect(secondGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g2',
        startTime: '2020-01-01T10:15:00.000Z',
        endTime: '2020-01-01T10:30:00.000Z',
      })
    );
    expect(thirdGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g3',
        startTime: '2020-01-01T10:30:00.000Z',
        endTime: '2020-01-01T10:45:00.000Z',
      })
    );
    expect(fourthGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g4',
        startTime: '2020-01-01T10:45:00.000Z',
        endTime: '2020-01-01T11:00:00.000Z',
      })
    );
  });

  test('keeps group numbers chronological when a round takes place in multiple rooms', () => {
    const roundActivityRoom1 = setExtensionData(
      'ActivityConfig',
      Activity({
        activityCode: '333-r1',
        startTime: '2020-01-01T10:00:00.000Z',
        endTime: '2020-01-01T10:45:00.000Z',
      }),
      { groups: 3 }
    );
    const roundActivityRoom2 = setExtensionData(
      'ActivityConfig',
      Activity({
        activityCode: '333-r1',
        startTime: '2020-01-01T10:10:00.000Z',
        endTime: '2020-01-01T10:40:00.000Z',
      }),
      { groups: 2 }
    );
    const wcif = Competition({
      events: [Event({ id: '333', rounds: [Round({ id: '333-r1' })] })],
      schedule: {
        venues: [
          Venue({
            rooms: [
              Room({ activities: [roundActivityRoom1] }),
              Room({ activities: [roundActivityRoom2] }),
            ],
          }),
        ],
      },
    });
    const updatedActivityRoom1 = createGroupActivities(wcif).schedule.venues[0]
      .rooms[0].activities[0];
    const updatedActivityRoom2 = createGroupActivities(wcif).schedule.venues[0]
      .rooms[1].activities[0];
    expect(updatedActivityRoom1.childActivities).toHaveLength(3);
    expect(updatedActivityRoom2.childActivities).toHaveLength(2);
    const [
      firstGroup,
      thirdGroup,
      fifthGroup,
    ] = updatedActivityRoom1.childActivities;
    const [secondGroup, fourthGroup] = updatedActivityRoom2.childActivities;
    expect(firstGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g1',
        startTime: '2020-01-01T10:00:00.000Z',
        endTime: '2020-01-01T10:15:00.000Z',
      })
    );
    expect(secondGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g2',
        startTime: '2020-01-01T10:10:00.000Z',
        endTime: '2020-01-01T10:25:00.000Z',
      })
    );
    expect(thirdGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g3',
        startTime: '2020-01-01T10:15:00.000Z',
        endTime: '2020-01-01T10:30:00.000Z',
      })
    );
    expect(fourthGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g4',
        startTime: '2020-01-01T10:25:00.000Z',
        endTime: '2020-01-01T10:40:00.000Z',
      })
    );
    expect(fifthGroup).toEqual(
      expect.objectContaining({
        activityCode: '333-r1-g5',
        startTime: '2020-01-01T10:30:00.000Z',
        endTime: '2020-01-01T10:45:00.000Z',
      })
    );
  });
});
