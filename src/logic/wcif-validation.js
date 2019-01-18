import { flatMap } from './utils';
import { activityCodeToName } from './activities';

export const validateWcif = wcif => {
  const { events } = wcif;
  const eventErrors = flatMap(events, event =>
    event.rounds.length === 0
      ? [`No rounds specified for ${activityCodeToName(event.id)}.`]
      : flatMap(event.rounds.slice(0, -1), round =>
        round.advancementCondition ? [] : [`Mising advancement condition for ${activityCodeToName(round.id)}.`]
      )
  );
  return eventErrors;
};
