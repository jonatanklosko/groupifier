/**
 * Checks the URL hash for presence of OAuth access token
 * and saves it in the session storage if it's found.
 * Should be called on application initialization (before any kind of router takes over the location).
 */
export const initializeAuth = () => {
  const hash = window.location.hash.replace(/^\W*/, '');
  const hashParams = new URLSearchParams(hash);
  if (hashParams.has('access_token')) {
    sessionStorage.setItem('Groupifier.accessToken', hashParams.get('access_token'));
    window.location.hash = '';
  }
};

export const wcaAccessToken = () =>
  sessionStorage.getItem('Groupifier.accessToken');

export const signIn = () => {
  const redirectUri = window.location.href.split('/#')[0];
  const params = new URLSearchParams({
    client_id: process.env.REACT_APP_WCA_OAUTH_CLIENT_ID,
    response_type: 'token',
    redirect_uri: redirectUri,
    scope: 'manage_competitions'
  });
  window.location = `${process.env.REACT_APP_WCA_ORIGIN}/oauth/authorize?${params}`
};

export const signOut = () =>
  sessionStorage.removeItem('Groupifier.accessToken');

export const isSignedIn = () => !!wcaAccessToken();
