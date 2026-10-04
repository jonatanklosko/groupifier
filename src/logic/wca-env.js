const searchParams = new URLSearchParams(window.location.search);

const wcaProdHost =
  searchParams.get('wca_prod_host') || 'www.worldcubeassociation.org';

export const PRODUCTION =
  searchParams.has('wca_prod_host') ||
  (process.env.NODE_ENV === 'production' && !searchParams.has('staging'));

export const WCA_ORIGIN = PRODUCTION
  ? `https://${wcaProdHost}`
  : 'https://staging.worldcubeassociation.org';

export const WCA_OAUTH_CLIENT_ID = PRODUCTION
  ? 'ontNJO4UBV7P-ShigoAwaP1g4peOANll4hyZOUWawj0'
  : 'example-application-id';
