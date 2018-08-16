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
