export const Competition = ({
  formatVersion = '1.0',
  id = 'Example2019',
  name = 'Example Competition 2019',
  shortName = 'Example 2019',
  persons = [],
  events = [],
  schedule = {},
  extensions = []
}) => ({
  formatVersion, id, name, shortName, persons, events, schedule, extensions
});

let personId = 1;
export const Person = ({
  name = `Person ${personId}`,
  wcaUserId = personId,
  wcaId = `2019PERS${personId % 100}`,
  registrantId = personId,
  countryIso2 = 'GB',
  gender = 'm',
  birthdate = '2000-01-01',
  email = `person${personId}@example.com`,
  registration = {},
  avatar = {
    url: 'https://example.com/avatar.jpg',
    thumbUrl: 'https://example.com/avatar-thumb.jpg'
  },
  roles = [],
  assignments = [],
  personalBests = []
}) => {
  personId++;
  return {
    name, wcaUserId, wcaId, registrantId, countryIso2, gender, birthdate, email,
    registration: {
      wcaRegistrationId: personId,
      eventIds: [],
      status: 'accepted',
      guests: 0,
      comments: '',
      ...registration
    },
    avatar, roles, assignments, personalBests
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

export const Event = ({
  id = '333',
  rounds = [],
  competitorLimit = null,
  qualification = null
}) => ({
  id, rounds, competitorLimit, qualification
});

export const Round = ({
  id = '333-r1',
  format = 'a',
  timeLimit = null,
  cutoff = null,
  advancementCondition = null,
  results = [],
  scrambleSetCount = 1,
  scrambleSets = []
}) => ({
  id, format, timeLimit, cutoff, advancementCondition, results, scrambleSetCount, scrambleSets
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
