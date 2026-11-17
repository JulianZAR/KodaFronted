// Keycloak and API configuration for production
export const environment = {
  production: true,
  apiUrl: 'https://kodabackend.onrender.com',
  keycloak: {
    url: 'https://nutrigo-keycloak.onrender.com',
    realm: 'nutrigo',
    clientId: 'nutrigo-angular',
  },
};
