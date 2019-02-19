/* Dirty hacks for compatibility with Cubecomps. Get rid of that once WCA Live is ready. */

import { acceptedPeople } from './competitors';

/* Generate ids the same way Cubecomps would do that.
   If competitors are already on Cubecomps, use those competitor ids instead. */
export const __withCubecompsIds__ = wcif => {
  const people = acceptedPeople(wcif);
  people.forEach((person, index) => person.registrantId = index + 1);
  return getCompetitions()
    .then(competitions => {
      const competition = competitions.find(competition => wcif.name.startsWith(competition.name));
      if (!competition) return null;
      return getCompetition(competition.id).then(competition => {
        if (competition.competitors.length === 0) return null;
        people.forEach(person => {
          const competitor = competition.competitors.find(competitor =>
            normalizeName(person.name).includes(normalizeName(competitor.name))
          );
          if (!competitor) throw new Error(`Couldn't find Cubecomps competitor id for ${person.name}.`);
          person.registrantId = parseInt(competitor.id, 10);
        });
      });
    })
    .then(() => wcif);
};

const normalizeName = name =>
  name.toLowerCase().trim().split(/s+/).join(' ');

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
