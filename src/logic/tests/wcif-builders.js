export const Competition = attributes => ({
  formatVersion: '1.0',
  id: 'Example2019',
  name: 'Example Competition 2019',
  shortName: 'Example 2019',
  persons: [],
  events: [],
  extensions: [],
  ...attributes,
  schedule: {
    startDate: '2020-01-01',
    numberOfDays: 2,
    venues: [],
    ...attributes.schedule
  }
});

let personId = 0;
export const Person = attributes => {
  personId++;
  return {
    name: `Person ${personId}`,
    wcaUserId: personId,
    wcaId: `2019PERS${personId % 100}`,
    registrantId: personId,
    countryIso2: 'GB',
    gender: 'm',
    birthdate: '2000-01-01',
    email: `person${personId}@example.com`,
    avatar: {
      url: 'https://example.com/avatar.jpg',
      thumbUrl: 'https://example.com/avatar-thumb.jpg'
    },
    roles: [],
    assignments: [],
    personalBests: [],
    ...attributes,
    registration: {
      wcaRegistrationId: personId,
      eventIds: [],
      status: 'accepted',
      guests: 0,
      comments: '',
      ...attributes.registration
    }
  };
};

export const PersonalBest = attributes => {
  const { eventId, worldRanking, type } = attributes;
  if (!eventId || !worldRanking || !type) throw new Error('PersonalBest requires eventId, worldRanking and type.');
  return {
    best: worldRanking * 200,
    continentalRanking: worldRanking,
    nationalRanking: worldRanking,
    ...attributes
  };
};

export const Event = attributes => ({
  id: '333',
  rounds: [],
  competitorLimit: null,
  qualification: null,
  ...attributes
});

export const Round = attributes => ({
  id: '333-r1',
  format: 'a',
  timeLimit: null,
  cutoff: null,
  advancementCondition: null,
  results: [],
  scrambleSetCount: 1,
  scrambleSets: [],
  ...attributes
});

export const Result = attributes => {
  const { personId, ranking } = attributes;
  if (!personId || !ranking) throw new Error('Result requires personId and ranking.');
  return {
    attempts: [
      { result: ranking * 200 },
      { result: ranking * 205 },
      { result: ranking * 150 },
      { result: ranking * 300 },
      { result: ranking * 101 }
    ],
    ...attributes
  };
};

let venueId = 1;
export const Venue = attributes => {
  venueId++;
  return {
    id: venueId,
    name: `Venue ${venueId}`,
    latitudeMicrodegrees: 0,
    longitudeMicrodegrees: 0,
    timezone: 'UTC',
    rooms: [],
    ...attributes
  };
};

let roomId = 1;
export const Room = attributes => {
  roomId++;
  return {
    id: roomId,
    name: `Room ${roomId}`,
    color: '#000000',
    activities: [],
    ...attributes
  };
};

let activityId = 1;
export const Activity = attributes => {
  activityId++;
  return {
    id: activityId,
    name: `Activity ${activityId}`,
    activityCode: 'other-misc-example',
    startTime: '2020-01-01T10:00:00.000Z',
    endTime: '2020-01-01T11:00:00.000Z',
    childActivities: [],
    scrambleSetId: null,
    ...attributes
  };
};
