import { updateIn, flatMap, zip, scaleToOne, isPresentDeep } from './utils';
import { getExtensionData, setExtensionData } from './wcif-extensions';
import { suggestedGroupCount, suggestedScramblerCount, suggestedRunnerCount } from './formulas';
import { eventNameById } from './events';

export const parseActivityCode = activityCode => {
  const [, e, r, g, a] = activityCode.match(/(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/);
  return {
    eventId: e,
    roundNumber: r && parseInt(r, 10),
    groupNumber: g && parseInt(g, 10),
    attemptNumber: a && parseInt(a, 10)
  };
};

export const activityCodeToName = activityCode => {
  const { eventId, roundNumber, groupNumber, attemptNumber } = parseActivityCode(activityCode);
  return [
    eventId && eventNameById(eventId),
    roundNumber && `Round ${roundNumber}`,
    groupNumber && `Group ${groupNumber}`,
    attemptNumber && `Attempt ${attemptNumber}`
  ].filter(x => x).join(', ');
};

export const shouldHaveGroups = activity => {
  const { eventId, roundNumber, groupNumber, attemptNumber } = parseActivityCode(activity.activityCode);
  return !!(eventId && roundNumber && !groupNumber && !attemptNumber);
};

export const activityDuration = activity =>
  new Date(activity.endTime) - new Date(activity.startTime);

export const activityStations = (wcif, activity) => {
  const room = rooms(wcif).find(room => room.activities.includes(activity));
  return getExtensionData('Room', room).stations;
};

export const populateActivitiesConfig = (wcif, expectedCompetitorsByRound, { assignScramblers, assignRunners, assignJudges }) => {
  const activities = flatMap(rooms(wcif), room =>
    room.activities.filter(shouldHaveGroups)
  );
  const activitiesWithConfig = flatMap(wcif.events, event => {
    return flatMap(event.rounds, round => {
      const competitors = expectedCompetitorsByRound[round.id];
      const roundActivities = activities
        .filter(activity => activity.activityCode.startsWith(round.id));
      const capacities = scaleToOne(roundActivities.map(activity =>
        activityStations(wcif, activity) * activityDuration(activity)
      ));
      return zip(roundActivities, capacities).map(([activity, capacity]) => {
        const stations = activityStations(wcif, activity);
        return setExtensionData('Activity', activity, {
          capacity,
          groups: suggestedGroupCount(Math.round(capacity * competitors.length), stations),
          scramblers: assignScramblers ? suggestedScramblerCount(stations) : 0,
          runners: assignRunners ? suggestedRunnerCount(stations) : 0,
          assignJudges: stations > 0 && assignJudges
        })
      });
    });
  });
  return activitiesWithConfig.reduce(updateActivity, wcif);
};

export const updateActivity = (wcif, updatedActivity) =>
  updateIn(wcif, ['schedule', 'venues', '0', 'rooms'], rooms =>
    rooms.map(room => ({
      ...room,
      activities: room.activities.map(activity => activity.id === updatedActivity.id ? updatedActivity : activity)
    }))
  );

export const anyActivityConfigured = wcif =>
  rooms(wcif).some(room =>
    room.activities.some(activity => getExtensionData('Activity', activity))
  );

export const activitiesConfigComplete = wcif =>
  rooms(wcif).every(room =>
    room.activities
      .filter(shouldHaveGroups)
      .map(activity => getExtensionData('Activity', activity))
      .every(isPresentDeep)
  );

export const roomsConfigComplete = wcif =>
  rooms(wcif)
    .map(room => getExtensionData('Room', room))
    .every(isPresentDeep);

export const activitiesOverlap = (first, second) =>
  first.startTime < second.endTime && second.startTime < first.endTime;

export const activitiesIntersection = (first, second) => {
  if (!activitiesOverlap(first, second)) return 0;
  const [, middleStart, middleEnd] = [first.startTime, first.endTime, second.startTime, second.endTime].sort();
  /* Time distance between the two middle points in time. */
  return new Date(middleEnd) - new Date(middleStart);
};

const allActivities = wcif => {
  const allChildActivities = ({ childActivities }) =>
    childActivities.length > 0
      ? [...childActivities, ...flatMap(childActivities, allChildActivities)]
      : childActivities;
  const activities = flatMap(rooms(wcif), room => room.activities);
  return [...activities, ...flatMap(activities, allChildActivities)];
};

export const maxActivityId = wcif =>
  Math.max(...allActivities(wcif).map(activity => activity.id));

/* Assigning tasks invokes activityById enormous number of times.
   But during that process activities (schedule) don't change.
   Caching is gives an invaluable speed boos in this case. */
const activitiesByIdCachedBySchedule = new Map();

export const activityById = (wcif, activityId) => {
  if (activitiesByIdCachedBySchedule.has(wcif.schedule)) {
    return activitiesByIdCachedBySchedule.get(wcif.schedule).get(activityId);
  } else {
    const activities = allActivities(wcif);
    const activitiesById = new Map(activities.map(activity => [activity.id, activity]));
    activitiesByIdCachedBySchedule.set(wcif.schedule, activitiesById);
    return activitiesById.get(activityId);
  }
}

export const hasDistributedAttempts = activityCode =>
  ['333fm', '333mbf'].includes(parseActivityCode(activityCode).eventId);

export const roundActivities = (wcif, roundId) =>
  flatMap(rooms(wcif), room =>
    room.activities.filter(({ activityCode }) => activityCode.startsWith(roundId))
  );

export const roundGroupActivities = (wcif, roundId) =>
  flatMap(roundActivities(wcif, roundId), activity =>
    hasDistributedAttempts(roundId) ? [activity] : activity.childActivities
  );

export const activityAssigned = (wcif, activityId) =>
  wcif.persons.some(person =>
    (person.assignments || []).some(assignment => assignment.activityId === activityId)
  );

export const groupActivitiesAssigned = (wcif, roundId) =>
  roundGroupActivities(wcif, roundId).some(activity =>
    activityAssigned(wcif, activity.id)
  );

const roundsWithoutResults = wcif =>
  wcif.events
    .map(event => event.rounds.find(round => round.results.length === 0))
    .filter(round => round);

export const roundsMissingAssignments = wcif =>
  roundsWithoutResults(wcif)
    .filter(round => !groupActivitiesAssigned(wcif, round.id));

export const roundsMissingScorecards = wcif =>
  roundsWithoutResults(wcif)
    .filter(round => groupActivitiesAssigned(wcif, round.id))
    .filter(round => parseActivityCode(round.id).eventId !== '333fm');

export const anyCompetitorAssignment = wcif =>
  wcif.persons.some(person =>
    (person.assignments || []).some(assignment => assignment.assignmentCode === 'competitor')
  );

export const allGroupsCreated = wcif =>
  wcif.events.every(event =>
    event.rounds.every(round =>
      roundGroupActivities(wcif, round.id).length > 0
    )
  );

export const anyGroupAssignedOrCreated = wcif =>
  wcif.events.some(event =>
    event.rounds.some(round =>
      hasDistributedAttempts(event.id)
        ? anyCompetitorAssignment(wcif, round.id)
        : roundGroupActivities(wcif, round.id).length > 0
    )
  );

export const rooms = wcif =>
  wcif.schedule.venues[0].rooms;
