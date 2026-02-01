/**
 * Genesis3 Module Test Configuration - Auth0 Extension
 *
 * Tests the complete Auth0 integration including:
 * - Spring Boot JWT validation and user sync
 * - React authentication flow
 * - Django JWT validation and user sync
 * - User profile endpoints
 * - Role-based access control
 * - OAuth2 conflict resolution
 * - SSO email verification bypass
 * - CORS www subdomain auto-include
 * - Role normalization to uppercase
 */

module.exports = {
  moduleId: 'extension-auth0',
  moduleName: 'Auth0 Authentication',

  scenarios: [
    {
      name: 'auth0-spring-boot-complete',
      description: 'Auth0 with Spring Boot - complete integration with user sync and profile endpoint',
      config: {
        moduleId: 'auth0-spring',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'myapp.auth0.com',
          auth0ClientId: 'abc123',
          auth0Audience: 'https://api.myapp.com',
          roleClaimKey: 'https://myapp.com/roles',
          tenantIdClaimKey: 'https://myapp.com/tenant_id',
          syncUserOnFirstLogin: true,
          updateUserOnEachLogin: false
        }
      },
      expectedFiles: [
        // Backend Auth0 integration
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
        'backend/src/main/java/com/example/config/CorsConfig.java',
        'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
        'backend/src/main/resources/application-auth0.yaml'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
          contains: [
            'Auth0UserSyncFilter',
            'OncePerRequestFilter',
            'UserService',
            'createOrUpdateUser',
            'tenantClaimKey',
            'HttpServletResponse.SC_INTERNAL_SERVER_ERROR',
            '@Value("${app.security.public-uris}")',
            'AntPathMatcher',
            'shouldNotFilter',
            'publicUris.split(",")',
            'pathMatcher.match(pattern, requestPath)',
            'isSsoLogin',
            'startsWith("auth0|")',
            'email_not_verified',
            'createUserOnFirstLogin',
            'updateUserOnEachLogin'
          ]
        },
        {
          file: 'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
          contains: [
            'SecurityFilterChain',
            'Auth0UserSyncFilter',
            '@Order(1)',
            'securityMatcher("/api/**")',
            'BearerTokenAuthenticationFilter',
            'toUpperCase()',
            'getIssuerUri'
          ]
        },
        {
          file: 'backend/src/main/java/com/example/config/CorsConfig.java',
          contains: [
            'CorsConfigurationSource',
            'withWww',
            'www.',
            'corsConfigurationSource'
          ]
        },
        {
          file: 'backend/src/main/resources/application-auth0.yaml',
          contains: [
            'app:',
            'auth0:',
            'domain:',
            'issuer:',
            'tenant-claim-key: https://myapp.com/tenant_id',
            'users:',
            'root: ${SPRING_ENV_ROOT_USER:}',
            'admins: ${SPRING_ENV_ADMIN_USERS:}',
            'create-user-on-first-login:',
            'update-user-on-each-login:',
            'cors:'
          ]
        }
      ]
    },
    {
      name: 'auth0-spring-boot-without-tenant',
      description: 'Auth0 with Spring Boot - without tenant ID claim (single-tenant)',
      config: {
        moduleId: 'auth0-spring-no-tenant',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'single.auth0.com',
          auth0ClientId: 'single123',
          auth0Audience: 'https://api.single.com',
          roleClaimKey: 'https://single.com/roles',
          tenantIdClaimKey: '' // Empty - single tenant
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
          contains: [
            'String tenantId = null'
          ]
        }
      ]
    },
    {
      name: 'auth0-spring-oauth2-no-conflict',
      description: 'Security config with explicit ordering to avoid OAuth2 conflicts',
      config: {
        moduleId: 'auth0-spring-order',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'order.auth0.com',
          roleClaimKey: 'roles'
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
          contains: [
            '@Order(1)',
            'securityMatcher("/api/**")',
            'auth0ApiFilterChain',
            'defaultFilterChain'
          ]
        }
      ]
    },
    {
      name: 'auth0-auto-issuer',
      description: 'Issuer auto-derived from domain',
      config: {
        moduleId: 'auth0-auto-issuer',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'autoissuer.auth0.com',
          roleClaimKey: 'roles'
        }
      },
      expectedFiles: [
        'backend/src/main/resources/application-auth0.yaml',
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/resources/application-auth0.yaml',
          contains: [
            'issuer-uri: ${AUTH0_ISSUER_URI:https://${AUTH0_DOMAIN:'
          ]
        },
        {
          file: 'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
          contains: [
            'getIssuerUri()',
            'https://" + auth0Domain + "/"'
          ]
        }
      ]
    },
    {
      name: 'auth0-email-verification-sso-bypass',
      description: 'SSO users bypass email verification',
      config: {
        moduleId: 'auth0-sso-bypass',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'sso.auth0.com',
          roleClaimKey: 'roles'
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
          contains: [
            'isSsoLogin',
            'startsWith("auth0|")',
            '!isSsoLogin && Boolean.FALSE.equals(emailVerified)',
            'email_not_verified'
          ]
        }
      ]
    },
    {
      name: 'auth0-role-uppercase',
      description: 'Roles normalized to uppercase',
      config: {
        moduleId: 'auth0-role-upper',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'roles.auth0.com',
          roleClaimKey: 'roles'
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
          contains: [
            'toUpperCase()',
            'Normalize all roles to UPPERCASE'
          ]
        }
      ]
    },
    {
      name: 'auth0-cors-www-subdomain',
      description: 'CORS auto-includes www subdomain',
      config: {
        moduleId: 'auth0-cors-www',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'cors.auth0.com',
          roleClaimKey: 'roles'
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/config/CorsConfig.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/config/CorsConfig.java',
          contains: [
            'www.',
            'withWww',
            'startsWith("www.")',
            'substring(4)'
          ]
        }
      ]
    },
    {
      name: 'auth0-react-complete',
      description: 'Auth0 with React - complete integration with protected routes and API client',
      config: {
        moduleId: 'auth0-react',
        kind: 'extension',
        type: 'auth0',
        providers: ['react'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'frontend.auth0.com',
          auth0ClientId: 'react123',
          auth0Audience: 'https://api.frontend.com',
          roleClaimKey: 'https://frontend.com/roles'
        }
      },
      expectedFiles: [
        'frontend/src/providers/Auth0Provider.tsx',
        'frontend/src/components/ProtectedRoute.tsx',
        'frontend/src/utils/apiClient.ts',
        'frontend/src/pages/Profile.tsx',
        'frontend/src/components/LoginButton.tsx',
        'frontend/src/components/LogoutButton.tsx',
        'frontend/src/hooks/useAuth.ts',
        'frontend/.env'
      ],
      fileContentChecks: [
        {
          file: 'frontend/src/providers/Auth0Provider.tsx',
          contains: [
            'Auth0Provider',
            'useNavigate',
            'onRedirectCallback',
            'appState?.returnTo',
            'window.location.pathname'
          ]
        },
        {
          file: 'frontend/src/components/ProtectedRoute.tsx',
          contains: [
            'ProtectedRoute',
            'loginWithRedirect',
            'appState: { returnTo }',
            'window.location.pathname + window.location.search'
          ]
        },
        {
          file: 'frontend/src/utils/apiClient.ts',
          contains: [
            'useApiClient',
            'getAccessTokenSilently',
            'Authorization: `Bearer ${token}`',
            'VITE_API_BASE'
          ]
        },
        {
          file: 'frontend/src/hooks/useAuth.ts',
          contains: [
            'isSsoUser',
            'isEmailVerified',
            'authProvider',
            'startsWith(\'auth0|\')',
            'email_verified === true || isSsoUser'
          ]
        },
        {
          file: 'frontend/src/pages/Profile.tsx',
          contains: [
            'Profile',
            'useApiClient',
            '/api/v1/protected/user/profile',
            'UserProfile',
            'roles'
          ]
        }
      ]
    },
    {
      name: 'auth0-react-sso-detection',
      description: 'React hook correctly detects SSO users',
      config: {
        moduleId: 'auth0-react-sso',
        kind: 'extension',
        type: 'auth0',
        providers: ['react'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'sso-react.auth0.com',
          roleClaimKey: 'roles'
        }
      },
      expectedFiles: [
        'frontend/src/hooks/useAuth.ts'
      ],
      fileContentChecks: [
        {
          file: 'frontend/src/hooks/useAuth.ts',
          contains: [
            'useMemo',
            'isSsoUser',
            'auth0|',
            'google-oauth2',
            'github',
            'authProvider',
            'split(\'|\')[0]'
          ]
        }
      ]
    },
    {
      name: 'auth0-django-complete',
      description: 'Auth0 with Django - complete integration with middleware and profile endpoint',
      config: {
        moduleId: 'auth0-django',
        kind: 'extension',
        type: 'auth0',
        providers: ['drf'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'django.auth0.com',
          auth0ClientId: 'django123',
          auth0Audience: 'https://api.django.com',
          roleClaimKey: 'https://django.com/roles',
          tenantIdClaimKey: 'https://django.com/tenant'
        }
      },
      expectedFiles: [
        'backend/auth/authentication.py',
        'backend/auth/permissions.py'
      ],
      fileContentChecks: [
        {
          file: 'backend/auth/authentication.py',
          contains: [
            'jwt.decode',
            'AUTH0_DOMAIN',
            'AUTH0_AUDIENCE'
          ]
        }
      ]
    },
    {
      name: 'auth0-full-stack-integration',
      description: 'Auth0 with full-stack (Spring + React) - end-to-end integration test',
      config: {
        moduleId: 'auth0-fullstack',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring', 'react'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'fullstack.auth0.com',
          auth0ClientId: 'fullstack123',
          auth0Audience: 'https://api.fullstack.com',
          roleClaimKey: 'https://fullstack.com/roles',
          tenantIdClaimKey: 'https://fullstack.com/tenant_id'
        }
      },
      expectedFiles: [
        // Backend files
        'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
        'backend/src/main/java/com/example/config/CorsConfig.java',
        'backend/src/main/resources/application-auth0.yaml',
        // Frontend files
        'frontend/src/providers/Auth0Provider.tsx',
        'frontend/src/components/ProtectedRoute.tsx',
        'frontend/src/utils/apiClient.ts',
        'frontend/src/hooks/useAuth.ts',
        'frontend/src/pages/Profile.tsx'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
          contains: ['Auth0UserSyncFilter', 'createOrUpdateUser', 'isSsoLogin']
        },
        {
          file: 'frontend/src/utils/apiClient.ts',
          contains: ['useApiClient', 'Authorization: `Bearer ${token}`']
        },
        {
          file: 'frontend/src/hooks/useAuth.ts',
          contains: ['isSsoUser', 'isEmailVerified']
        }
      ]
    },
    {
      name: 'auth0-rbac-integration',
      description: 'Auth0 with RBAC extension - verify user profile endpoint integration',
      dependencies: ['extension-rbac'],
      config: {
        moduleId: 'auth0-rbac',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'rbac.auth0.com',
          auth0ClientId: 'rbac123',
          auth0Audience: 'https://api.rbac.com',
          roleClaimKey: 'https://rbac.com/roles'
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/controller/secure/UserProfileController.java'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/controller/secure/UserProfileController.java',
          contains: [
            '@RequestMapping("/api/v1/protected/user")',
            '@GetMapping("/profile")',
            'UserService',
            'findByEmail',
            'UserRsp'
          ]
        }
      ]
    },
    {
      name: 'auth0-with-digitalocean-provider',
      description: 'Auth0 with DigitalOcean provider - verify secrets work with DO deployment',
      config: {
        moduleId: 'auth0-do',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring', 'digitalocean'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'do-test.auth0.com',
          auth0ClientId: 'do123',
          auth0Audience: 'https://api.do-test.com',
          roleClaimKey: 'https://do-test.com/roles',
          syncUserOnFirstLogin: true
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
        'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
        'backend/src/main/resources/application-auth0.yaml'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/resources/application-auth0.yaml',
          contains: [
            'AUTH0_DOMAIN',
            'AUTH0_CLIENT_ID'
          ]
        }
      ]
    },
    {
      name: 'auth0-fullstack-digitalocean',
      description: 'Auth0 full-stack with DigitalOcean - Spring + React + DO',
      config: {
        moduleId: 'auth0-fullstack-do',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring', 'react', 'digitalocean'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'fullstack-do.auth0.com',
          auth0ClientId: 'fullstack-do-123',
          auth0Audience: 'https://api.fullstack-do.com',
          roleClaimKey: 'https://fullstack-do.com/roles',
          tenantIdClaimKey: 'https://fullstack-do.com/tenant_id'
        }
      },
      expectedFiles: [
        // Backend files
        'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
        // Frontend files
        'frontend/src/providers/Auth0Provider.tsx',
        'frontend/src/hooks/useAuth.ts'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
          contains: ['Auth0UserSyncFilter', 'createOrUpdateUser']
        },
        {
          file: 'frontend/src/hooks/useAuth.ts',
          contains: ['isSsoUser', 'isEmailVerified']
        }
      ]
    }
  ],

  templateValidations: [
    {
      name: 'oauth2-conflict-resolution',
      template: 'extension-auth0/code-spring/src/main/java/{{packagePath}}/config/SecurityAuth0Config.java.mustache',
      contains: ['@Order(1)', 'securityMatcher("/api/**")'],
      reason: 'Must have explicit ordering to avoid OAuth2 provider conflicts'
    },
    {
      name: 'auto-issuer-derivation',
      template: 'extension-auth0/code-spring/src/main/java/{{packagePath}}/config/SecurityAuth0Config.java.mustache',
      contains: ['getIssuerUri()', 'auth0Domain'],
      reason: 'Must auto-derive issuer from domain when not explicitly configured'
    },
    {
      name: 'sso-email-bypass-spring',
      template: 'extension-auth0/code-spring/src/main/java/{{packagePath}}/security/Auth0UserSyncFilter.java.mustache',
      contains: ['isSsoLogin', 'startsWith("auth0|")', 'email_not_verified'],
      reason: 'Must bypass email verification for SSO users (they verify emails)'
    },
    {
      name: 'sso-email-bypass-react',
      template: 'extension-auth0/code-react/src/hooks/useAuth.ts.mustache',
      contains: ['isSsoUser', 'isEmailVerified', 'email_verified === true || isSsoUser'],
      reason: 'Must expose SSO detection and email verification bypass in React'
    },
    {
      name: 'role-uppercase-normalization',
      template: 'extension-auth0/code-spring/src/main/java/{{packagePath}}/config/SecurityAuth0Config.java.mustache',
      contains: ['toUpperCase()'],
      reason: 'Must normalize roles to UPPERCASE for consistency'
    },
    {
      name: 'cors-www-auto-include',
      template: 'extension-auth0/code-spring/src/main/java/{{packagePath}}/config/CorsConfig.java.mustache',
      contains: ['withWww', 'www.', 'startsWith("www.")'],
      reason: 'Must auto-include www subdomain for each CORS origin'
    },
    {
      name: 'user-sync-configurable',
      template: 'extension-auth0/code-spring/src/main/java/{{packagePath}}/security/Auth0UserSyncFilter.java.mustache',
      contains: ['createUserOnFirstLogin', 'updateUserOnEachLogin'],
      reason: 'User sync behavior must be configurable'
    }
  ]
};
