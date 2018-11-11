import { zip, flatMap, scaleToOne, findLast, intersection, updateIn, sortBy, sortByArray, addMilliseconds, difference, partition } from './utils';
import { getExtensionData } from './wcif-extensions';
import { activityDuration, activityCodeToName, updateActivity, activitiesOverlap,
         parseActivityCode, maxActivityId, activityById, roundActivities,
         roundGroupActivities, roundsMissingAssignments, hasDistributedAttempts } from './activities';
import { competitorsForRound, bestAverageAndSingle, age, staffAssignments, staffAssignmentsForEvent } from './competitors';

export const createGroupActivities = wcif => {
  const rounds = flatMap(wcif.events, wcifEvent => wcifEvent.rounds);
  return rounds.reduce((wcif, round) => {
    /* For FMC and MBLD the activities are already scheduled, and there is always a single group. */
    if (hasDistributedAttempts(round.id)) return wcif;
    /* If there are already groups created, don't override them. */
    if (roundGroupActivities(wcif, round.id).length > 0) return wcif;
    const currentActivityId = maxActivityId(wcif);
    const activitiesWithGroups = roundActivities(wcif, round.id).map(activity => {
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
    sortByArray(
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

export const assignTasks = wcif => {
  /* TODO: Create groups if there are none. */
  const roundsToAssign = roundsMissingAssignments(wcif);
  return [assignGroups, assignScrambling, assignRunning, assignJudging]
    .reduce((wcif, assignmentFn) => assignmentFn(wcif, roundsToAssign), wcif);
};

const assignGroups = (wcif, roundsToAssign) => {
  /* Sort rounds by the number of groups, so the further the more possible timeframes there are. */
  const sortedRoundsToAssign = sortBy(roundsToAssign, round =>
    hasDistributedAttempts(round.id) ? -Infinity : roundGroupActivities(wcif, round.id).length
  );
  return sortedRoundsToAssign.reduce((wcif, round) => {
    const competitors = competitorsForRound(wcif, round.id);
    if (hasDistributedAttempts(round.id)) {
      /* In this case roundActivities are attempt activities, so we assign them all to the given person. */
      const updatedCompetitors = roundActivities(wcif, round.id).reduce((competitors, activity) =>
        assignActivity(activity, 'competitor', competitors)
      , competitors);
      return updatePeople(wcif, updatedCompetitors);
    }
    const groupActivitiesWithCapacity = flatMap(roundActivities(wcif, round.id), activity => {
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
      const preferredGroups = possibleGroups.filter(group => !overlapsEveryoneWithSameRole(wcif, groups, group.activity, competitor));
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
      assignActivity(activity, 'competitor', competitors)
    );
    return updatePeople(wcif, updatedCompetitors);
  }, wcif);
};

const calculateGroupSizes = ([capacity, ...capacities], competitorCount) => {
  if (!capacity) return [];
  const groupSize = Math.round(capacity * competitorCount);
  return [groupSize, ...calculateGroupSizes(scaleToOne(capacities), competitorCount - groupSize)];
};

const moveSomeoneRight = (wcif, groups, groupId) => {
  const group = groups.find(({ id }) => id === groupId);
  return groups.slice(groups.indexOf(group) + 1).reduce((updatedGroups, furtherGroup) => {
    if (updatedGroups) return updatedGroups;
    const competitorToMove = findLast(group.competitors, competitor =>
      availableDuring(wcif, furtherGroup.activity, competitor)
      && !overlapsEveryoneWithSameRole(wcif, groups, furtherGroup.activity, competitor)
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
      && !overlapsEveryoneWithSameRole(wcif, groups, previousGroup.activity, competitor)
    );
    if (!competitorToMove) return null; // Try the previous group.
    const groupsWithSpot = moveSomeoneRight(wcif, groups, previousGroup.id);
    return groupsWithSpot && moveCompetitorToGroupEnd(groupsWithSpot, groupId, previousGroup.id, competitorToMove);
  }, null);
};

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

const assignScrambling = (wcif, roundsToAssign) => {
  /* Sort rounds by the number of competitors, so the further the more people able to scramble there are. */
  const sortedRoundsToAssign = sortBy(roundsToAssign, round => competitorsForRound(wcif, round.id).length);
  return sortedRoundsToAssign.reduce((wcif, round) => {
    if (hasDistributedAttempts(round.id)) return wcif;
    const eventId = parseActivityCode(round.id).eventId;
    return roundActivities(wcif, round.id).reduce((wcif, activity) => {
      const { scramblers } = getExtensionData('Activity', activity);
      if (scramblers === 0) return wcif;
      return activity.childActivities.reduce((wcif, groupActivity) => {
        const staffScramblers = wcif.persons.filter(person => person.roles.includes('staff-scrambler')) ;
        const competitors = difference(competitorsForRound(wcif, round.id), staffScramblers);
        const available = people => people.filter(person => availableDuring(wcif, groupActivity, person));
        const sortedAvailableStaff = sortByArray(available(staffScramblers), competitor => [
          Math.floor(staffAssignments(competitor).length / 3),
          ...bestAverageAndSingle(competitor, eventId)
        ]);
        const sortedAvailableCompetitors = sortedAvailableStaff.length >= scramblers ? [] : sortByArray(available(competitors), competitor => [
          age(competitor) >= 10 ? -1 : 1,
          intersection(['dataentry', 'delegate', 'organizer'], competitor.roles).length,
          staffAssignmentsForEvent(wcif, competitor, eventId).length >= 2 ? 1 : -1,
          Math.floor(staffAssignments(competitor).length / 6),
          ...bestAverageAndSingle(competitor, eventId)
        ]);
        const potentialScramblers = [...sortedAvailableStaff, ...sortedAvailableCompetitors];
        const updatedCompetitors = assignActivity(groupActivity, 'staff-scrambler', potentialScramblers.slice(0, scramblers));
        return updatePeople(wcif, updatedCompetitors);
      }, wcif);
    }, wcif);
  }, wcif);
};

const assignRunning = (wcif, roundsToAssign) => {
  return roundsToAssign.reduce((wcif, round) => {
    if (hasDistributedAttempts(round.id)) return wcif;
    const eventId = parseActivityCode(round.id).eventId;
    return roundActivities(wcif, round.id).reduce((wcif, activity) => {
      const { runners } = getExtensionData('Activity', activity);
      if (runners === 0) return wcif;
      return activity.childActivities.reduce((wcif, groupActivity) => {
        const [staffRunners, people] = partition(wcif.persons, person => person.roles.includes('staff-runner'));
        const available = people => people.filter(person => availableDuring(wcif, groupActivity, person));
        const sortedAvailableStaff = sortByArray(available(staffRunners), competitor => [
          Math.floor(staffAssignments(competitor).length / 3)
        ]);
        const sortedAvailablePeople = sortedAvailableStaff.length >= runners ? [] : sortByArray(available(people), competitor => [
          age(competitor) >= 10 ? -1 : 1,
          intersection(['dataentry', 'delegate', 'organizer'], competitor.roles).length,
          staffAssignmentsForEvent(wcif, competitor, eventId).length >= 2 ? 1 : -1,
          Math.floor(staffAssignments(competitor).length / 6)
        ]);
        const potentialRunners = [...sortedAvailableStaff, ...sortedAvailablePeople];
        const updatedPeople = assignActivity(groupActivity, 'staff-runner', potentialRunners.slice(0, runners));
        return updatePeople(wcif, updatedPeople);
      }, wcif);
    }, wcif);
  }, wcif);
};

const assignJudging = (wcif, roundsToAssign) => {
  return roundsToAssign.reduce((wcif, round) => {
    if (hasDistributedAttempts(round.id)) return wcif;
    const eventId = parseActivityCode(round.id).eventId;
    return roundActivities(wcif, round.id).reduce((wcif, activity) => {
      const { assignJudges } = getExtensionData('Activity', activity);
      const room = wcif.schedule.venues[0].rooms.find(room => room.activities.includes(activity));
      const { stations } = getExtensionData('Room', room);
      if (!assignJudges) return wcif;
      return activity.childActivities.reduce((wcif, groupActivity) => {
        const [staffJudges, people] = partition(wcif.persons, person => person.roles.includes('staff-judge'));
        const available = people => people.filter(person => availableDuring(wcif, groupActivity, person));
        const sortedAvailableStaff = sortByArray(available(staffJudges), competitor => [
          Math.floor(staffAssignments(competitor).length / 3)
        ]);
        const sortedAvailablePeople = sortedAvailableStaff.length >= stations ? [] : sortByArray(available(people), competitor => [
          age(competitor) >= 10 ? -1 : 1,
          intersection(['dataentry', 'delegate', 'organizer'], competitor.roles).length,
          staffAssignmentsForEvent(wcif, competitor, eventId).length >= 2 ? 1 : -1,
          staffAssignments(competitor).length
        ]);
        const potentialJudges = [...sortedAvailableStaff, ...sortedAvailablePeople];
        const updatedPeople = assignActivity(groupActivity, 'staff-judge', potentialJudges.slice(0, stations));
        return updatePeople(wcif, updatedPeople);
      }, wcif);
    }, wcif);
  }, wcif);
};

const assignActivity = (activity, assignmentCode, competitors) =>
  competitors.map(competitor => ({
    ...competitor,
    assignments: [...(competitor.assignments || []), { activityId: activity.id, assignmentCode }]
  }));

const updatePeople = (wcif, updatedPeople) =>
  updateIn(wcif, ['persons'], persons => persons.map(person =>
    updatedPeople.find(updatedPerson => updatedPerson.wcaUserId === person.wcaUserId) || person
  ));

const availableDuring = (wcif, activity, competitor) =>
  !(competitor.assignments || []).some(({ activityId }) =>
    activitiesOverlap(activityById(wcif, activityId), activity)
  );

const overlapsEveryoneWithSameRole = (wcif, groups, activity, competitor) =>
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
