import { roundIdToName } from './formatters';

const best = (person, eventId, type = 'single') => {
  const personalBest = person.personalBests.find(pb => pb.eventId === eventId && pb.type === type);
  return personalBest ? personalBest.best : Infinity;
};

const advancingCompetitors = (sortedCompetitors, advancementCondition, eventId) => {
  switch (advancementCondition.type) {
    case 'ranking':
      return sortedCompetitors.slice(0, advancementCondition.level);
    case 'percent':
      return sortedCompetitors.slice(0, Math.floor(sortedCompetitors.length * advancementCondition.level * 0.01));
    case 'attemptResult':
      /* Assume that competitors having personal best better than the advancement condition will make it to the next round. */
      return sortedCompetitors.filter(person => best(person, eventId) < advancementCondition.level);
    default:
      throw new Error(`Unrecognised AdvancementCondition type: '${advancementCondition.type}'`);
  }
};

const getPredictedCompetitorsByRound = wcif =>
  wcif.events.reduce((competitorsByRound, wcifEvent) => {
    const [firstRound, ...nextRounds] = wcifEvent.rounds;
    competitorsByRound[firstRound.id] = wcif.persons
      .filter(person => person.registration && person.registration.eventIds.includes(wcifEvent.id))
      .sort((person1, person2) => best(person1, wcifEvent.id) - best(person2, wcifEvent.id));
    nextRounds.reduce(([round, competitors], nextRound) => {
      const advancementCondition = round.advancementCondition;
      if (!advancementCondition) throw new Error(`Mising advancement condition for ${roundIdToName(round.id)}.`);
      const nextRoundCompetitors = advancingCompetitors(competitors, advancementCondition, wcifEvent.id);
      competitorsByRound[nextRound.id] = nextRoundCompetitors;
      return [nextRound, nextRoundCompetitors];
    }, [firstRound, competitorsByRound[firstRound.id]]);
    return competitorsByRound;
  }, {});

export {
  getPredictedCompetitorsByRound
};
