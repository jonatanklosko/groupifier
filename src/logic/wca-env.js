const searchParams = new URLSearchParams(window.location.search);
const production = process.env.NODE_ENV === 'production' && !searchParams.get('staging');

export const WCA_ORIGIN = production
  ? 'https://www.worldcubeassociation.org'
  : 'https://staging.worldcubeassociation.org';

export const WCA_OAUTH_CLIENT_ID = production
  ? '7af43bdb765a9b555e09cc575351d15acee640c0db098626e40e8d1ee352ec3a'
  : 'example-application-id';
