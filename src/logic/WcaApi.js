import Auth from './Auth';

const WcaApi = {
  getUpcomingManageableCompetitions() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      managed_by_me: true,
      start: oneWeekAgo.toISOString()
    });
    return this.wcaApiFetch(`/competitions?${params}}`);
  },

  wcaApiFetch(path, fetchOptions = {}) {
    const baseApiUrl = `${process.env.REACT_APP_WCA_ORIGIN}/api/v0`;

    return fetch(`${baseApiUrl}${path}`, Object.assign({}, fetchOptions, {
      headers: new Headers({
        'Authorization': `Bearer ${Auth.wcaAccessToken}`,
        'Content-Type': 'application/json'
      })
    }))
    .then(response => response.json());
  }
};

export default WcaApi;
