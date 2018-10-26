export const suggestedGroupCount = (competitorCount, stations) => {
  if (stations === 0) return 1;
  const preferredGroupSize = stations * 1.7;
  /* We calculate the number of perfectly-sized groups, and round it up starting from x.1,
     this way we don't end up with much more than the perfect amount of people in a single group.
     Having more small groups is preferred over having fewer big groups. */
  const calculatedGroupCount = Math.round(competitorCount / preferredGroupSize + 0.4);
  /* Suggest at least 2 groups, so that there are people to scramble. */
  return Math.max(calculatedGroupCount, 2);
};

export const suggestedScramblerCount = stations =>
  Math.floor(Math.log2(stations + 1));

export const suggestedRunnerCount = stations =>
  Math.floor(Math.log(stations + 2) / Math.log(3));
