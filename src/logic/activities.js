import { updateIn, flatMap, zip } from './helpers';
import { getGroupifierData, setGroupifierData } from './wcifExtensions';
import { suggestedGroupCount } from './groups';

const parseActivityCode = activityCode => {
  const [, e, r, g, a] = activityCode.match(/(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/);
  return {
    eventId: e,
    roundNumber: r && parseInt(r, 10),
    groupNumber: g && parseInt(g, 10),
    attemptNumber: a && parseInt(a, 10)
  };
};

/* We store configuration in round activities.
   In case of FM and MBLD use the first attempt activity instead
   (as there's no top level round activity for these). */
export const isActivityConfigurable = activity => {
  const { eventId, roundNumber, groupNumber, attemptNumber } = parseActivityCode(activity.activityCode);
  return eventId && roundNumber && !groupNumber
    && (['333fm', '333mbf'].includes(eventId) ? attemptNumber === 1 : !attemptNumber);
};

const activityDuration = activity =>
  new Date(activity.endTime) - new Date(activity.startTime)

const activityStations = (wcif, activity) => {
  const room = wcif.schedule.venues[0].rooms.find(room => room.activities.includes(activity));
  return getGroupifierData(room).stations;
};

const suggestedScramblerCount = stations =>
  Math.floor(Math.log2(stations + 1));

const suggestedRunnerCount = stations =>
  Math.floor(Math.log(stations + 2) / Math.log(3));

export const populateActivitiesConfig = (wcif, expectedCompetitorsByRound, { assignScramblers, assignRunners, assignJudges }) => {
  const activities = flatMap(wcif.schedule.venues[0].rooms, room =>
    room.activities.filter(isActivityConfigurable)
  );
  const activitiesWithConfig = flatMap(wcif.events, wcifEvent => {
    return flatMap(wcifEvent.rounds, round => {
      const competitors = expectedCompetitorsByRound[round.id];
      const roundActivities = activities
        .filter(activity => activity.activityCode.startsWith(round.id));
      const densities = roundActivities
        .map(activity => activityStations(wcif, activity) * activityDuration(activity));
      const densitiesSum = densities.reduce((x, y) => x + y, 0);
      const normalizedDensities = densities.map(density => densitiesSum !== 0 ? density / densitiesSum : 1 / densities.length);
      return zip(roundActivities, normalizedDensities).map(([activity, density]) => {
        const stations = activityStations(wcif, activity);
        return setGroupifierData('Activity', activity, {
          density,
          groups: suggestedGroupCount(Math.floor(density * competitors.length), wcifEvent.id, stations),
          scramblers: assignScramblers ? suggestedScramblerCount(stations) : 0,
          runners: assignRunners ? suggestedRunnerCount(stations) : 0,
          assignJudges
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
  wcif.schedule.venues[0].rooms.some(room =>
    room.activities.some(getGroupifierData)
  );
