import { addMilliseconds, difference, findLast, flatMap, intersection, partition,
         scaleToOne, sortBy, sortByArray, sum, uniq, updateIn, zip } from './utils';
import { getExtensionData } from './wcif-extensions';
import { activitiesIntersection, activitiesOverlap, activityById, activityCodeToName,
         activityDuration, hasDistributedAttempts, maxActivityId, parseActivityCode,
         rooms, roundActivities, roundGroupActivities, roundsMissingAssignments, updateActivity } from './activities';
import { acceptedPeople, age, bestAverageAndSingle, competitorsForRound, staffAssignments, staffAssignmentsForEvent } from './competitors';

export const createGroupActivities = wcif => {
  const rounds = flatMap(wcif.events, event => event.rounds);
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
      const availabilityRates = groups.map(group => availabilityRate(wcif, group.activity, competitor));
      const maxAvailabilityRate = Math.max(...availabilityRates);
      const mostAvailableGroups = groups.filter((group, index) => availabilityRates[index] === maxAvailabilityRate);
      const preferredGroups = mostAvailableGroups.filter(group => !overlapsEveryoneWithSameRole(wcif, groups, group.activity, competitor));
      const potentialGroups = preferredGroups.length > 0 ? preferredGroups : mostAvailableGroups;
      const notFullGroup = potentialGroups.find(({ size, competitors }) => competitors.length < size);
      if (notFullGroup) {
        return addCompetitorToGroupEnd(groups, notFullGroup.id, competitor);
      } else {
        const group = potentialGroups[potentialGroups.length - 1];
        const updatedGroups = addCompetitorToGroupEnd(groups, group.id, competitor);
        return moveSomeoneRight(wcif, updatedGroups, group.id) || moveSomeoneLeft(wcif, updatedGroups, group.id) || updatedGroups;
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
      availabilityRate(wcif, group.activity, competitor) === availabilityRate(wcif, furtherGroup.activity, competitor)
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
      availabilityRate(wcif, group.activity, competitor) === availabilityRate(wcif, previousGroup.activity, competitor)
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
        const staffScramblers = acceptedPeople(wcif).filter(person => person.roles.includes('staff-scrambler')) ;
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
        const [staffRunners, people] = partition(acceptedPeople(wcif), person => person.roles.includes('staff-runner'));
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
      const room = rooms(wcif).find(room => room.activities.includes(activity));
      const { stations } = getExtensionData('Room', room);
      if (!assignJudges) return wcif;
      return activity.childActivities.reduce((wcif, groupActivity) => {
        const [staffJudges, people] = partition(acceptedPeople(wcif), person => person.roles.includes('staff-judge'));
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

const availabilityRate = (wcif, activity, competitor) => {
  const intersections = (competitor.assignments || []).map(({ activityId }) =>
    activitiesIntersection(activityById(wcif, activityId), activity)
  );
  const timeWhenBusy = sum(intersections);
  return -(timeWhenBusy / activityDuration(activity));
};

const overlapsEveryoneWithSameRole = (wcif, groups, activity, competitor) =>
  intersection(['dataentry', 'delegate', 'organizer'], competitor.roles)
    .some(role => {
      const others = acceptedPeople(wcif).filter(person => person.roles.includes(role));
      return others.length > 0 && others.every(other =>
        !availableDuring(wcif, activity, other)
        || groups.some(({ activity: groupActivity, competitors }) =>
          competitors.includes(other) && activitiesOverlap(groupActivity, activity)
        )
      );
    });

export const updateScrambleSetCount = wcif => ({
  ...wcif,
  events: wcif.events.map(event => ({
    ...event,
    rounds: event.rounds.map(round => ({
      ...round,
      scrambleSetCount: scrambleSetCountForRound(wcif, round.id)
    }))
  }))
});

/* Assume one scramble set for each unique timeframe, i.e. (startTime, endTime) pair. */
const scrambleSetCountForRound = (wcif, roundId) =>
  hasDistributedAttempts(roundId) ? 1 : uniq(
    roundGroupActivities(wcif, roundId).map(({ startTime, endTime }) => startTime + endTime)
  ).length;
