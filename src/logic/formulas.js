export const suggestedGroupCount = (competitors, stations) => {
  if (stations === 0) return 1;
  const preferredGroupSize = stations * 1.7;
  /* We calculate the number of perfectly-sized groups, and round it up starting from x.1,
     this way we don't end up with much more than the perfect amount of people in a single group.
     Having more small groups is preferred over having fewer big groups. */
  const calculatedGroupCount = Math.round(competitors / preferredGroupSize + 0.4);
  /* Suggest at least 2 groups, so that there are people to scramble. */
  return Math.max(calculatedGroupCount, 2);
};

/* Take min{groupCompetitors, stations} (i.e. stations in use) and suggest one scrambler for each 5 of them. */
export const suggestedScramblerCount = (groupCompetitors, stations) =>
  Math.floor(1 + (Math.min(groupCompetitors, stations) - 1) / 5);

/* Take min{groupCompetitors, stations} (i.e. stations in use) and suggest one runner for each 8 of them. */
export const suggestedRunnerCount = (groupCompetitors, stations) =>
  Math.floor(1 + (Math.min(groupCompetitors, stations) - 1) / 8);
