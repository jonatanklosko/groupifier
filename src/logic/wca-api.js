import { wcaAccessToken } from './auth';

export const getUpcomingManageableCompetitions = () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    managed_by_me: true,
    start: oneWeekAgo.toISOString()
  });
  return wcaApiFetch(`/competitions?${params}}`);
};

export const getCompetitionWcif = competitionId =>
  wcaApiFetch(`/competitions/${competitionId}/wcif`);

export const saveWcifChanges = (wcif, updatedWcif) =>
  Promise.all([
    wcif.persons !== updatedWcif.persons && patchWcifAttribute(updatedWcif, 'persons'),
    wcif.events !== updatedWcif.events && patchWcifAttribute(updatedWcif, 'events'),
    wcif.schedule !== updatedWcif.schedule && patchWcifAttribute(updatedWcif, 'schedule'),
  ]);

const patchWcifAttribute = (wcif, attribute) =>
  wcaApiFetch(`/competitions/${wcif.id}/wcif/${attribute}`, { method: 'PATCH', body: JSON.stringify(wcif[attribute]) });

const wcaApiFetch = (path, fetchOptions = {}) => {
  const baseApiUrl = `${process.env.REACT_APP_WCA_ORIGIN}/api/v0`;

  return fetch(`${baseApiUrl}${path}`, Object.assign({}, fetchOptions, {
    headers: new Headers({
      'Authorization': `Bearer ${wcaAccessToken()}`,
      'Content-Type': 'application/json'
    })
  }))
  .then(response => response.json());
};
