const searchParams = new URLSearchParams(window.location.search);
export const PRODUCTION =
  process.env.NODE_ENV === 'production' && !searchParams.has('staging');

export const WCA_ORIGIN = PRODUCTION
  ? 'https://www.worldcubeassociation.org'
  : 'https://staging.worldcubeassociation.org';

export const WCA_OAUTH_CLIENT_ID = PRODUCTION
  ? 'ontNJO4UBV7P-ShigoAwaP1g4peOANll4hyZOUWawj0'
  : 'example-application-id';
