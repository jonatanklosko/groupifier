export const Competition = ({
  formatVersion = '1.0',
  id = 'Example2019',
  name = 'Example Competition 2019',
  shortName = 'Example 2019',
  persons = [],
  eventIds = [],
  schedule = {},
  extensions = []
}) => ({
  formatVersion, id, name, shortName, persons, eventIds, schedule, extensions
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
