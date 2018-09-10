import { flatMap } from './utils';
import { getExtensionData } from './wcif-extensions';
import { activityDuration, activityCodeToName, updateActivity } from './activities';

const addMilliseconds = (isoTime, milliseconds) =>
  new Date(new Date(isoTime).getTime() + milliseconds).toISOString();

export const createGroupActivities = wcif => {
  const rounds = flatMap(wcif.events, wcifEvent => wcifEvent.rounds);
  const activities = flatMap(wcif.schedule.venues[0].rooms, room => room.activities);
  const updatedActivities = flatMap(rounds, round => {
    const roundActivities = activities.filter(activity => activity.activityCode === round.id);
    if (roundActivities.length === 0) return 'SCHEDULE DOES NOT INCLUDE THIS ACTIVITY'; // TODO: Validate that schedule is complete beforehand.
    const activitiesWithGroups = roundActivities.map(activity => {
      const { groups } = getExtensionData('Activity', activity);
      const totalDuration = activityDuration(activity);
      const groupDuration = totalDuration / groups;
      const groupActivities = Array.from({ length: groups }, (_, index) => ({
        id: null,
        name: null,
        activityCode: null,
        startTime: addMilliseconds(activity.startTime, groupDuration * index),
        endTime: addMilliseconds(activity.startTime, groupDuration * index + groupDuration),
        childActivities: [],
        scrambleSetId: null
      }));
      return { ...activity, childActivities: groupActivities };
    });
    /* The child activities are newly created objects, so it's fine to mutate them at this point. */
    flatMap(activitiesWithGroups, activity => activity.childActivities)
      .sort((a1, a2) => new Date(a1.startTime) - new Date(a2.startTime))
      .forEach((groupActivity, index) => {
        const activityCode = `${round.id}-g${index + 1}`;
        return Object.assign(groupActivity, {
          id: null,
          name: activityCodeToName(activityCode),
          activityCode
        })
      });
    return activitiesWithGroups;
  });
  console.log(updatedActivities);
  return updatedActivities.reduce(updateActivity, wcif);
}
