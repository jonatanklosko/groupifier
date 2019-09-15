const nextIdByBuilder = new Map();
const withId = builder => {
  nextIdByBuilder.set(builder, 1);
  return attributes => {
    const id = nextIdByBuilder.get(builder);
    nextIdByBuilder.set(builder, id + 1);
    return builder(id)(attributes);
  };
};

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
    ...attributes.schedule,
  },
});

export const Person = withId(id => attributes => ({
  name: `Person ${id}`,
  wcaUserId: id,
  wcaId: `2019PERS${id % 100}`,
  registrantId: id,
  countryIso2: 'GB',
  gender: 'm',
  birthdate: '2000-01-01',
  email: `person${id}@example.com`,
  avatar: {
    url: 'https://example.com/avatar.jpg',
    thumbUrl: 'https://example.com/avatar-thumb.jpg',
  },
  roles: [],
  assignments: [],
  personalBests: [],
  ...attributes,
  registration: {
    wcaRegistrationId: id,
    eventIds: [],
    status: 'accepted',
    guests: 0,
    comments: '',
    ...attributes.registration,
  },
}));

export const PersonalBest = attributes => {
  const { eventId, worldRanking, type } = attributes;
  if (!eventId || !worldRanking || !type)
    throw new Error('PersonalBest requires eventId, worldRanking and type.');
  return {
    best: worldRanking * 200,
    continentalRanking: worldRanking,
    nationalRanking: worldRanking,
    ...attributes,
  };
};

export const Event = attributes => ({
  id: '333',
  rounds: [],
  competitorLimit: null,
  qualification: null,
  extensions: [],
  ...attributes,
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
  extensions: [],
  ...attributes,
});

export const Result = attributes => {
  const { personId, ranking } = attributes;
  if (!personId) throw new Error('Result requires personId.');
  return {
    attempts: [
      { result: ranking * 200 },
      { result: ranking * 205 },
      { result: ranking * 150 },
      { result: ranking * 300 },
      { result: ranking * 101 },
    ],
    ...attributes,
  };
};

export const Venue = withId(id => attributes => ({
  id,
  name: `Venue ${id}`,
  latitudeMicrodegrees: 0,
  longitudeMicrodegrees: 0,
  timezone: 'UTC',
  rooms: [],
  extensions: [],
  ...attributes,
}));

export const Room = withId(id => attributes => ({
  id: id,
  name: `Room ${id}`,
  color: '#000000',
  activities: [],
  extensions: [],
  ...attributes,
}));

export const Activity = withId(id => attributes => ({
  id: id,
  name: `Activity ${id}`,
  activityCode: 'other-misc-example',
  startTime: '2020-01-01T10:00:00.000Z',
  endTime: '2020-01-01T11:00:00.000Z',
  childActivities: [],
  scrambleSetId: null,
  extensions: [],
  ...attributes,
}));
