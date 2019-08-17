const searchParams = new URLSearchParams(window.location.search);
export const PRODUCTION = process.env.NODE_ENV === 'production' && !searchParams.has('staging');

export const WCA_ORIGIN = PRODUCTION
  ? 'https://www.worldcubeassociation.org'
  : 'https://staging.worldcubeassociation.org';

export const WCA_OAUTH_CLIENT_ID = PRODUCTION
  ? '7af43bdb765a9b555e09cc575351d15acee640c0db098626e40e8d1ee352ec3a'
  : 'example-application-id';
