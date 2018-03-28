const Auth = {
  /**
   * Checks URL hash for the presence of OAuth access token
   * and saves it in the session storage if it's found.
   * Should be called on application initialization (before any kind of router takes over the location).
   */
  initialize() {
    const hash = window.location.hash.replace(/^\W*/, '');
    const hashParams = new URLSearchParams(hash);
    if (hashParams.has('access_token')) {
      sessionStorage.setItem('Groupifier.accessToken', hashParams.get('access_token'));
      window.location.hash = '';
    }
  },

  get wcaAccessToken() {
    return sessionStorage.getItem('Groupifier.accessToken');
  },

  signIn() {
    const redirectUri = window.location.href.split('/#')[0];
    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_WCA_OAUTH_CLIENT_ID,
      response_type: 'token',
      redirect_uri: redirectUri,
      scope: 'manage_competitions'
    });
    window.location = `${process.env.REACT_APP_WCA_ORIGIN}/oauth/authorize?${params}`
  },

  signOut() {
    sessionStorage.removeItem('Groupifier.accessToken');
  },

  isSignedIn() {
    return !!this.wcaAccessToken;
  }
};

export default Auth;
