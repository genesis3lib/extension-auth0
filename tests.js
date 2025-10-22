/**
 * Genesis3 Module Test Configuration - Auth0 Extension
 */

module.exports = {
  moduleId: 'extension-auth0',
  moduleName: 'Auth0 Authentication',

  scenarios: [
    {
      name: 'auth0-with-spring',
      description: 'Auth0 extension with Spring Boot backend',
      config: {
        moduleId: 'auth0-ext',
        kind: 'extension',
        type: 'auth0',
        layers: ['ops'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'myapp.auth0.com',
          auth0ClientId: 'abc123',
          auth0Audience: 'https://api.myapp.com'
        }
      },
      expectedFiles: [
        'ops/auth0-config.yaml'
      ]
    },
    {
      name: 'auth0-with-react',
      description: 'Auth0 extension with React frontend',
      config: {
        moduleId: 'auth0-frontend',
        kind: 'extension',
        type: 'auth0',
        layers: ['ops'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'frontend.auth0.com',
          auth0ClientId: 'xyz789'
        }
      },
      expectedFiles: [
        'ops/auth0-config.yaml'
      ]
    }
  ]
};
