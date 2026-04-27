import { flatMap } from './utils';
import { activityCodeToName, roundActivities } from './activities';

export const validateWcif = wcif => {
  const { events } = wcif;
  const eventRoundErrors = flatMap(events, event => {
    if (event.rounds.length === 0)
      return [`No rounds specified for ${activityCodeToName(event.id)}.`];
    const participationRulesetErrors = flatMap(event.rounds, round =>
      round.participationRuleset &&
      round.participationRuleset.participationSource
        ? []
        : [
            `No participation ruleset specified for ${activityCodeToName(
              round.id
            )}.`,
          ]
    );
    const roundActivityErrors = flatMap(event.rounds, round =>
      roundActivities(wcif, round.id).length > 0
        ? []
        : [`No schedule activities for ${activityCodeToName(round.id)}.`]
    );
    return [...participationRulesetErrors, ...roundActivityErrors];
  });
  return eventRoundErrors;
};
