import { wcaAccessToken } from './auth';
import { WCA_ORIGIN } from './wca-env';
import { pick } from './utils';

export const getUpcomingManageableCompetitions = () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    managed_by_me: true,
    start: oneWeekAgo.toISOString(),
    sort: 'start_date',
  });
  return wcaApiFetch(`/competitions?${params.toString()}`);
};

export const getWcif = competitionId =>
  wcaApiFetch(`/competitions/${competitionId}/wcif`);

const updateWcif = (competitionId, wcif) =>
  wcaApiFetch(`/competitions/${competitionId}/wcif`, {
    method: 'PATCH',
    body: JSON.stringify(wcif),
  });

export const saveWcifChanges = (previousWcif, newWcif) => {
  const keysDiff = Object.keys(newWcif).filter(
    key => previousWcif[key] !== newWcif[key]
  );
  if (keysDiff.length === 0) return Promise.resolve();

  let wcifDiff = pick(newWcif, keysDiff);

  // TODO: remove once WCIF registration status evaluation is resolved
  if (wcifDiff.persons) {
    const persons = wcifDiff.persons.map(
      ({ registration, ...person }) => person
    );
    wcifDiff = { ...wcifDiff, persons };
  }

  return updateWcif(newWcif.id, wcifDiff);
};

const wcaApiFetch = (path, fetchOptions = {}) => {
  const baseApiUrl = `${WCA_ORIGIN}/api/v0`;

  return fetch(
    `${baseApiUrl}${path}`,
    Object.assign({}, fetchOptions, {
      headers: new Headers({
        Authorization: `Bearer ${wcaAccessToken()}`,
        'Content-Type': 'application/json',
      }),
    })
  )
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response;
    })
    .then(response => response.json());
};
