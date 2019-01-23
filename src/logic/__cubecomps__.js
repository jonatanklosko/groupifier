/* Dirty hacks for compatibility with Cubecomps. Get rid of that once WCA Live is ready. */

import { acceptedPeople } from './competitors';

/* If the competition is already on Cubecomps, use those competitor ids.
   Otherwise generate ids the same way Cubecomps would do that. */
export const __withCubecompsIds__ = wcif =>
  getCompetitions()
    .then(competitions => {
      const competition = competitions.find(competition => wcif.name.startsWith(competition.name));
      if (competition) {
        return getCompetition(competition.id).then(competition =>
          acceptedPeople(wcif).forEach(person => {
            const competitor = competition.competitors.find(competitor => person.name.includes(competitor.name));
            if (!competitor) throw new Error(`Couldn't find Cubecomps competitor id for ${person.name}.`);
            person.registrantId = parseInt(competitor.id, 10);
          })
        );
      } else {
        acceptedPeople(wcif).forEach((person, index) => person.registrantId = index + 1);
      }
    })
    .then(() => wcif);

const getCompetitions = () =>
  cubecompsApiFetch('/competitions')
    .then(competitions => Object.values(competitions).reduce((x, y) => x.concat(y), []));

const getCompetition = competitionCubecompsId =>
  cubecompsApiFetch(`/competitions/${competitionCubecompsId}`);

const cubecompsApiFetch = (path, fetchOptions = {}) => {
  const baseApiUrl = 'https://m.cubecomps.com/api/v1';

  return fetch(`${baseApiUrl}${path}`, Object.assign({}, fetchOptions, {
      headers: new Headers({ 'Content-Type': 'application/json' })
    }))
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response;
    })
    .then(response => response.json());
};
