import { isSelfsufficient } from './events';

export const suggestedGroupCount = (competitorCount, eventId, stations) => {
  if (isSelfsufficient(eventId)) {
    return 1;
  } else {
    const preferredGroupSize = stations * 1.7;
    /* We calculate the number of perfectly-sized groups, and round it up starting from x.1,
       this way we don't end up with much more than the perfect amount of people in a single group.
       Having more small groups is preferred over having fewer big groups. */
    const calculatedGroupCount = Math.round(competitorCount / preferredGroupSize + 0.4);
    /* Suggest at least 2 groups, so that there are people to scramble. */
    return Math.max(calculatedGroupCount, 2);
  }
};
