// Keycloak and API configuration for all environments
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  keycloak: {
    url:      'http://localhost:8081',
    realm:    'nutrigo',
    clientId: 'nutrigo-angular',
  },
};
