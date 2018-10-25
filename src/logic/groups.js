import { zip, flatMap, scaleToOne, findLast, intersection, updateIn, sortBy, addMilliseconds } from './utils';
import { getExtensionData } from './wcif-extensions';
import { activityDuration, activityCodeToName, updateActivity, activitiesOverlap, parseActivityCode, maxActivityId, activityById } from './activities';
import { competitorsForRound } from './competitors';

export const createGroupActivities = wcif => {
  const rounds = flatMap(wcif.events, wcifEvent => wcifEvent.rounds);
  const activities = flatMap(wcif.schedule.venues[0].rooms, room => room.activities);
  return rounds.reduce((wcif, round) => {
    /* For FMC and MBLD the activities are already scheduled, and there is always a single group. */
    if (hasDistributedAttempts(round.id)) return wcif;
    /* If there are already groups created, don't override them. */
    if (roundGroupActivities(wcif, round.id).length > 0) return wcif;
    const roundActivities = activities.filter(activity => activity.activityCode === round.id);
    const currentActivityId = maxActivityId(wcif);
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
    sortBy(
      flatMap(activitiesWithGroups, activity => activity.childActivities),
      ({ startTime, endTime }) => [startTime, endTime]
    ).forEach((groupActivity, index) => {
      const activityCode = `${round.id}-g${index + 1}`;
      /* The child activities are newly created objects, so it's fine to mutate them at this point. */
      return Object.assign(groupActivity, {
        id: currentActivityId + index + 1,
        name: activityCodeToName(activityCode),
        activityCode
      })
    });
    return activitiesWithGroups.reduce(updateActivity, wcif);
  }, wcif);
};

export const assignGroups = wcif => {
  const activities = flatMap(wcif.schedule.venues[0].rooms, room => room.activities);
  const roundsToAssign = wcif.events
    .map(wcifEvent => wcifEvent.rounds.find(round => (round.results || []).length === 0))
    .filter(round => round && !groupsAssigned(wcif, round.id));
  /* Sort rounds by the number of groups, so the further the more possible timeframes there are. */
  const sortedRoundsToAssign = sortBy(roundsToAssign, round => {
    if (hasDistributedAttempts(round.id)) return -Infinity;
    const roundActivities = activities.filter(activity => activity.activityCode.startsWith(round.id));
    return roundActivities.reduce((groupCount, activity) =>
      groupCount + getExtensionData('Activity', activity).groups
    , 0);
  });
  return sortedRoundsToAssign.reduce((wcif, round) => {
    const roundActivities = activities.filter(activity => activity.activityCode.startsWith(round.id));
    const competitors = competitorsForRound(wcif, round.id);
    if (hasDistributedAttempts(round.id)) {
      /* In this case roundActivities are attempt activities, so we assign them all to the given person. */
      const updatedCompetitors = roundActivities.reduce(assignActivity, competitors);
      return updateIn(wcif, ['persons'], persons => persons.map(person =>
        updatedCompetitors.find(competitor => competitor.wcaUserId === person.wcaUserId) || person
      ));
    }
    const groupActivitiesWithCapacity = flatMap(roundActivities, activity => {
      const { capacity } = getExtensionData('Activity', activity);
      return activity.childActivities.map(groupActivity =>
        [groupActivity, capacity / activity.childActivities.length]
      );
    });
    const [groupActivities, capacities] = zip(...groupActivitiesWithCapacity);
    const groupSizes = calculateGroupSizes(capacities, competitors.length);
    const initialGroups = zip(groupActivities, groupSizes).map(([activity, size]) => ({
      id: activity.id,
      activity,
      size,
      competitors: []
    }));
    const sortedInitialGroups = sortBy(initialGroups, ({ activity }) => parseActivityCode(activity.activityCode).groupNumber);

    const groups = competitors.reduce((groups, competitor) => {
      const possibleGroups = groups.filter(group => availableDuring(wcif, group.activity, competitor));
      const preferredGroups = possibleGroups.filter(group => !overlapsAllCrucialPeople(wcif, groups, group.activity, competitor));
      const potentialGroups = preferredGroups.length > 0 ? preferredGroups : possibleGroups;
      const notFullGroups = groups.filter(({ size, competitors }) => competitors.length < size);
      if (potentialGroups.length > 0) {
        const notFullGroup = potentialGroups.find(group => notFullGroups.includes(group));
        if (notFullGroup) {
          return addCompetitorToGroupEnd(groups, notFullGroup.id, competitor);
        } else {
          const group = potentialGroups[potentialGroups.length - 1];
          const updatedGroups = addCompetitorToGroupEnd(groups, group.id, competitor);
          return moveSomeoneRight(wcif, updatedGroups, group.id) || moveSomeoneLeft(wcif, updatedGroups, group.id) || updatedGroups;
        }
      } else {
        return addCompetitorToGroupEnd(groups, notFullGroups[0].id, competitor);
      }
    }, sortedInitialGroups);

    const updatedCompetitors = flatMap(groups, ({ activity, competitors }) =>
      assignActivity(competitors, activity)
    );
    return updateIn(wcif, ['persons'], persons => persons.map(person =>
      updatedCompetitors.find(competitor => competitor.wcaUserId === person.wcaUserId) || person
    ));
  }, wcif);
};

const hasDistributedAttempts = roundId =>
  ['333fm', '333mbf'].includes(parseActivityCode(roundId).eventId);

const groupsAssigned = (wcif, roundId) =>
  roundGroupActivities(wcif, roundId).some(activity =>
    wcif.persons.some(person =>
      (person.assignments || []).some(assignment => assignment.activityId === activity.id)
    )
  );

const roundGroupActivities = (wcif, roundId) =>
  flatMap(wcif.schedule.venues[0].rooms, room =>
    flatMap(
      room.activities.filter(({ activityCode }) => activityCode.startsWith(roundId)),
      activity => hasDistributedAttempts(roundId) ? [activity] : activity.childActivities
    )
  );

const assignActivity = (competitors, activity) =>
  competitors.map(competitor => ({
    ...competitor,
    assignments: [...(competitor.assignments || []), { activityId: activity.id, assignmentCode: 'competitor' }]
  }));

const calculateGroupSizes = ([capacity, ...capacities], competitorCount) => {
  if (!capacity) return [];
  const groupSize = Math.round(capacity * competitorCount);
  return [groupSize, ...calculateGroupSizes(scaleToOne(capacities), competitorCount - groupSize)];
};

const availableDuring = (wcif, activity, competitor) =>
  !(competitor.assignments || []).some(({ activityId }) =>
    activitiesOverlap(activityById(wcif, activityId), activity)
  );

const overlapsAllCrucialPeople = (wcif, groups, activity, competitor) =>
  intersection(['dataentry', 'delegate', 'organizer'], competitor.roles)
    .some(role => {
      const others = wcif.persons.filter(person => person.roles.includes(role));
      return others.length > 0 && others.every(other =>
        !availableDuring(wcif, activity, other)
        || groups.some(({ activity: groupActivity, competitors }) =>
          competitors.includes(other) && activitiesOverlap(groupActivity, activity)
        )
      );
    });

const updateCompetitorsInGroup = (groups, groupId, updater) =>
  groups.map(group => group.id === groupId ? updateIn(group, ['competitors'], updater) : group);

const addCompetitorToGroupStart = (groups, groupId, competitor) =>
  updateCompetitorsInGroup(groups, groupId, competitors => [competitor, ...competitors]);

const addCompetitorToGroupEnd = (groups, groupId, competitor) =>
  updateCompetitorsInGroup(groups, groupId, competitors => [...competitors, competitor]);

const removeCompetitorFromGroup = (groups, groupId, competitor) =>
  updateCompetitorsInGroup(groups, groupId, competitors => competitors.filter(other => other !== competitor));

const moveCompetitorToGroupStart = (groups, fromGroupId, toGroupId, competitor) =>
  addCompetitorToGroupStart(removeCompetitorFromGroup(groups, fromGroupId, competitor), toGroupId, competitor);

const moveCompetitorToGroupEnd = (groups, fromGroupId, toGroupId, competitor) =>
  addCompetitorToGroupEnd(removeCompetitorFromGroup(groups, fromGroupId, competitor), toGroupId, competitor);

const moveSomeoneRight = (wcif, groups, groupId) => {
  const group = groups.find(({ id }) => id === groupId);
  return groups.slice(groups.indexOf(group) + 1).reduce((updatedGroups, furtherGroup) => {
    if (updatedGroups) return updatedGroups;
    const competitorToMove = findLast(group.competitors, competitor =>
      availableDuring(wcif, furtherGroup.activity, competitor)
      && !overlapsAllCrucialPeople(wcif, groups, furtherGroup.activity, competitor)
    );
    if (!competitorToMove) return null; // Try the next group.
    if (furtherGroup.competitors.length < furtherGroup.size) {
      return moveCompetitorToGroupStart(groups, groupId, furtherGroup.id, competitorToMove);
    } else if (furtherGroup.competitors.length === furtherGroup.size) {
      const groupsWithSpot = moveSomeoneRight(wcif, groups, furtherGroup.id);
      return groupsWithSpot && moveCompetitorToGroupStart(groupsWithSpot, groupId, furtherGroup.id, competitorToMove);
    }
    return null;
  }, null);
};

const moveSomeoneLeft = (wcif, groups, groupId) => {
  const group = groups.find(({ id }) => id === groupId);
  return groups.slice(0, groups.indexOf(group)).reduceRight((updatedGroups, previousGroup) => {
    if (updatedGroups) return updatedGroups;
    const competitorToMove = group.competitors.find(competitor =>
      availableDuring(wcif, previousGroup.activity, competitor)
      && !overlapsAllCrucialPeople(wcif, groups, previousGroup.activity, competitor)
    );
    if (!competitorToMove) return null; // Try the previous group.
    const groupsWithSpot = moveSomeoneRight(wcif, groups, previousGroup.id);
    return groupsWithSpot && moveCompetitorToGroupEnd(groupsWithSpot, groupId, previousGroup.id, competitorToMove);
  }, null);
};
