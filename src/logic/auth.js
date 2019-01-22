import { WCA_ORIGIN, WCA_OAUTH_CLIENT_ID } from './wca-env';

/* Use separate set of keys for each OAuth client (e.g. for WCA production and staging). */
const localStorageKey = key => `GroupifierNext.${WCA_OAUTH_CLIENT_ID}.${key}`;

/**
 * Checks the URL hash for presence of OAuth access token
 * and saves it in the local storage if it's found.
 * Should be called on application initialization (before any kind of router takes over the location).
 */
export const initializeAuth = () => {
  const hash = window.location.hash.replace(/^\W*/, '');
  const hashParams = new URLSearchParams(hash);
  if (hashParams.has('access_token')) {
    localStorage.setItem(localStorageKey('accessToken'), hashParams.get('access_token'));
  }
  if (hashParams.has('expires_in')) {
    /* Expire the token 15 minutes before it actually does,
       this way it doesn't expire right after the user enters the page. */
    const expiresInSeconds = hashParams.get('expires_in') - 15 * 60;
    const expirationTime = new Date(new Date().getTime() + expiresInSeconds * 1000);
    localStorage.setItem(localStorageKey('expirationTime'), expirationTime.toISOString());
  }
  /* If the token expired, sign the user out. */
  const expirationTime = localStorage.getItem(localStorageKey('expirationTime'));
  if (expirationTime && new Date() >= new Date(expirationTime)) {
    signOut();
  }
  /* Clear the hash only if there is a token, otherwise it may be a router path. */
  if (hashParams.has('access_token')) {
    window.location.hash = '';
  }
};

export const wcaAccessToken = () =>
  localStorage.getItem(localStorageKey('accessToken'));

export const signIn = () => {
  const params = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    response_type: 'token',
    redirect_uri: oauthRedirectUri(),
    scope: 'manage_competitions'
  });
  window.location = `${WCA_ORIGIN}/oauth/authorize?${params.toString()}`
};

const oauthRedirectUri = () => {
  const { origin, pathname, search } = window.location;
  const searchParams = new URLSearchParams(search);
  const staging = searchParams.get('staging');
  const appUri = `${origin}${pathname}`.replace(/\/$/, '');
  return staging ? `${appUri}?staging=true` : appUri;
};

export const signOut = () =>
  localStorage.removeItem(localStorageKey('accessToken'));

export const isSignedIn = () => !!wcaAccessToken();
