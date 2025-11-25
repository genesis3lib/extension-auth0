/**
 * Genesis3 Module Test Configuration - Auth0 Extension
 *
 * Tests the complete Auth0 integration including:
 * - Spring Boot JWT validation and user sync
 * - React authentication flow
 * - Django JWT validation and user sync
 * - User profile endpoints
 * - Role-based access control
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
          tenantIdClaimKey: 'https://myapp.com/tenant_id'
        }
      },
      expectedFiles: [
        // Backend Auth0 integration
        'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
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
            'pathMatcher.match(pattern, requestPath)'
          ]
        },
        {
          file: 'backend/src/main/java/com/example/config/SecurityAuth0Config.java',
          contains: [
            'SecurityFilterChain',
            'Auth0UserSyncFilter',
            '.requestMatchers("/api/v1/public/**", "/actuator/health").permitAll()',
            '.requestMatchers("/api/v1/protected/**").authenticated()',
            'BearerTokenAuthenticationFilter'
          ]
        },
        {
          file: 'backend/src/main/resources/application-auth0.yaml',
          contains: [
            'app:',
            'auth0:',
            'tenant-claim-key: https://myapp.com/tenant_id',
            'users:',
            'root: ${SPRING_ENV_ROOT_USER:}',
            'admins: ${SPRING_ENV_ADMIN_USERS:}'
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
        'backend/auth/middleware.py',
        'backend/auth/permissions.py',
        'backend/prj_myapp/settings/auth0.py',
        'backend/app_rbac/views.py',
        'backend/app_rbac/serializers.py'
      ],
      fileContentChecks: [
        {
          file: 'backend/auth/middleware.py',
          contains: [
            'Auth0UserSyncMiddleware',
            'User.objects.update_or_create',
            'APP_USERS_ROOT',
            'APP_USERS_ADMINS',
            'UserRole.ROOT',
            'UserRole.ADMIN',
            'UserRole.USER',
            'status=500',
            '/api/v1/public/',
            '/health',
            '_is_public_path',
            'fnmatch'
          ]
        },
        {
          file: 'backend/auth/authentication.py',
          contains: [
            'Auth0JSONWebTokenAuthentication',
            'Auth0User',
            'jwt.decode',
            'AUTH0_DOMAIN',
            'AUTH0_AUDIENCE'
          ]
        },
        {
          file: 'backend/app_rbac/views.py',
          contains: [
            'UserProfileView',
            'import uuid',
            'requestId',
            'response',
            'User.objects.get(email=email, deleted=False)'
          ]
        },
        {
          file: 'backend/app_rbac/serializers.py',
          contains: [
            'UserProfileSerializer',
            'external_auth_provider',
            'external_auth_id',
            'enabled'
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
        'backend/src/main/resources/application-auth0.yaml',
        // Frontend files
        'frontend/src/providers/Auth0Provider.tsx',
        'frontend/src/components/ProtectedRoute.tsx',
        'frontend/src/utils/apiClient.ts',
        'frontend/src/pages/Profile.tsx'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/security/Auth0UserSyncFilter.java',
          contains: ['Auth0UserSyncFilter', 'createOrUpdateUser']
        },
        {
          file: 'frontend/src/utils/apiClient.ts',
          contains: ['useApiClient', 'Authorization: `Bearer ${token}`']
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
      name: 'auth0-api-contract-consistency',
      description: 'Auth0 API contract consistency - verify Spring Boot and Django return identical response format',
      dependencies: ['extension-rbac'],
      config: {
        moduleId: 'auth0-contract-test',
        kind: 'extension',
        type: 'auth0',
        providers: ['spring', 'drf'],
        enabled: true,
        fieldValues: {
          auth0Domain: 'contract.auth0.com',
          auth0ClientId: 'contract123',
          auth0Audience: 'https://api.contract.com',
          roleClaimKey: 'https://contract.com/roles'
        }
      },
      expectedFiles: [
        'backend/src/main/java/com/example/controller/secure/UserProfileController.java',
        'backend/app_rbac/views.py',
        'backend/app_rbac/serializers.py'
      ],
      fileContentChecks: [
        {
          file: 'backend/src/main/java/com/example/controller/secure/UserProfileController.java',
          contains: [
            '@GetMapping("/profile")',
            'ResponseBody<UserRsp>',
            '.requestId(UUID.randomUUID().toString())',
            '.response(userRsp)',
            'findByEmail'
          ]
        },
        {
          file: 'backend/app_rbac/views.py',
          contains: [
            'UserProfileView',
            'import uuid',
            "'requestId': str(uuid.uuid4())",
            "'response': serializer.data",
            'User.objects.get(email=email, deleted=False)'
          ]
        },
        {
          file: 'backend/app_rbac/serializers.py',
          contains: [
            'UserProfileSerializer',
            'external_auth_provider',
            'external_auth_id',
            'enabled',
            'roles'
          ]
        }
      ]
    }
  ]
};
