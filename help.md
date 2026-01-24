# Auth0 Authentication

This extension adds OAuth2 authentication using Auth0 to your application. Auth0 handles user login, registration, password reset, and multi-factor authentication so you don't have to build these features yourself.

## Prerequisites

Before configuring this extension, you need to:
1. Create a free Auth0 account at https://auth0.com
2. Create an Auth0 Application (Single Page Application type for React frontend)

## How to Create an Auth0 Application

### 1. Create Application
- Go to https://manage.auth0.com/dashboard
- Click **Create Application**
- **Name**: Your application name (e.g., Grablin)
- **Application type**: Single Page Web Applications
- Click **Create**

### 2. Configure Application Settings
- Navigate to **Settings** tab
- Note down:
  - **Domain**: e.g., `dev-exjsxdx8c6qt3uhf.us.auth0.com`
  - **Client ID**: e.g., `7sn1sBCSTYRKPJDNERio1beSBc0CTrGR`
  - **Client Secret**: e.g., `*****zRR**Fi-****`
- Update **Application URIs** and **Cross-Origin Authentication** settings:
  - Add callback URLs (local dev: `http://localhost:5173`)
  - Add logout URLs (local dev: `http://localhost:5173`)
- Click **Save Changes**

### 3. Create API (for backend authentication)
- Click **Applications** → **APIs** in left navigation
- Click **Create**
- **Name**: Your API name (e.g., grablin-api)
- **Identifier**: Your API URL (e.g., `https://gen3-api.grabl.in/api/v2/`)
  - This is just an identifier, not a real URL
- **JWT Profile**: Auth0 (default)
- **JWT Signing Algorithm**: RS256 (default)
- Click **Create**

---

## Configuration Fields

### Scaffold Configuration

These settings are configured once during project generation.

#### Enable Role-Based Access Control `enableRbac`
**What it is**: Determines whether to include role-based permissions in your application (e.g., admin users vs regular users).

**Options**:
- `true` (default): Users can have roles like "admin", "user", "moderator" that control what they can access
- `false`: All authenticated users have the same permissions

**When to use**:
- Enable if you need different permission levels (recommended for most apps)
- Disable if all users should have identical access

---

#### Role Claim Key `roleClaimKey`
**What it is**: The name of the field in the authentication token where user roles are stored.

**Default value**: Will be set at runtime based on your Auth0 configuration.

**How to find it**:
1. In Auth0 Dashboard, go to Actions � Flows
2. Click on "Login" flow
3. If you have custom Actions that add roles to tokens, note the claim key used
4. Common values: `https://myapp.com/roles` or `roles`

**Note**: This is an advanced setting. Leave it as default if you're not sure. The system will configure it automatically.

---

#### Tenant ID JWT Claim Key `tenantIdClaimKey`
**What it is**: If your application serves multiple organizations/companies (multi-tenant), this is the field name where the organization ID is stored in the token.

**Default value**: Empty (for single-tenant applications)

**When to use**:
- **Leave empty** if you're building an app for a single company/organization
- **Fill in** if your app serves multiple organizations (like Slack, where each workspace is a separate tenant)

**Example**: If you're building a SaaS product where Company A and Company B each have their own isolated data, you'd use this to identify which company a user belongs to.

---

### Runtime Configuration

These are the credentials from your Auth0 application. You'll need to get these from the Auth0 Dashboard.

#### Auth0 Domain `AUTH0_DOMAIN`
**What it is**: Your unique Auth0 domain URL where authentication happens.

**How to find it**:
1. Log into Auth0 Dashboard
2. Go to Applications � Applications
3. Click on your application
4. Look for "Domain" in the Basic Information section
5. Copy the domain (e.g., `mycompany.auth0.com`)

**Format**: Just the domain, without `https://` (e.g., `mycompany.auth0.com`)

**Example**: `mycompany.auth0.com` or `mycompany.us.auth0.com`

---

#### Auth0 Client ID `AUTH0_CLIENT_ID`
**What it is**: A unique identifier for your Auth0 application. This is public and safe to include in your frontend code.

**How to find it**:
1. Log into Auth0 Dashboard
2. Go to Applications � Applications
3. Click on your application
4. Look for "Client ID" in the Basic Information section
5. Copy the Client ID

**Format**: A long alphanumeric string (e.g., `abc123xyz789`)

**Example**: `xF8Jz9K2mQ4nR6tY3pL5vB8wH1cD7eA0`

---

#### Auth0 Client Secret `AUTH0_CLIENT_SECRET`
**What it is**: A secret password for your application's backend to authenticate with Auth0. **Keep this confidential!**

**How to find it**:
1. Log into Auth0 Dashboard
2. Go to Applications � Applications
3. Click on your application
4. Look for "Client Secret" in the Basic Information section
5. Copy the Client Secret (you may need to click "Show" to reveal it)

**Important**:
- **Never** commit this to version control
- **Never** expose this in frontend code
- Only use this in backend/server code
- Store securely (environment variables, secrets manager)

**Format**: A long alphanumeric string

---

#### Auth0 Audience `AUTH0_AUDIENCE`
**What it is**: The identifier for your Auth0 API. This tells Auth0 which API the frontend is requesting access to.

**How to find it**:
1. Log into Auth0 Dashboard
2. Go to Applications � APIs
3. Click on your API (create one if you haven't - see "Create an API" section above)
4. Look for "Identifier" field
5. Copy the Identifier value

**Format**: Usually a URL-like string (doesn't have to be a real URL)

**Example**: `https://api.myapp.com` or `https://mycompany.auth0.com/api/v2/`

**Note**: This must match exactly what you entered when creating the Auth0 API.

---

## Common Issues

### "Invalid Callback URL"
**Problem**: Auth0 rejects the login redirect.

**Solution**: Make sure you've added your application URLs to the Auth0 Application settings:
- Go to Applications → Applications → Your App → Settings
- Add URLs to "Allowed Callback URLs" (e.g., `http://localhost:5173`, `https://myapp.com`)
- Add URLs to "Allowed Logout URLs"
- Click "Save Changes"

### "Invalid Audience"
**Problem**: Auth0 rejects API requests.

**Solution**:
- Verify the `AUTH0_AUDIENCE` matches your API Identifier exactly
- Make sure you've created an API in Auth0 Dashboard (Applications → APIs)

### "Unauthorized"
**Problem**: Backend rejects authenticated requests.

**Solution**:
- Verify `AUTH0_DOMAIN` matches your tenant domain
- Verify `AUTH0_CLIENT_SECRET` is correct
- Check that the Auth0 Application and API are in the same tenant

### CORS Error with www Subdomain
**Problem**: CORS blocks requests from `www.example.com` when only `example.com` is configured.

**Solution**: The extension automatically includes www variants for each allowed origin. Make sure you've set:
- `CORS_ALLOWED_ORIGINS=https://example.com` - www.example.com will be auto-included
- Or explicitly add both: `CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com`

### SSO Users Flagged for Email Verification
**Problem**: Users who logged in via Google, GitHub, or other SSO providers are incorrectly asked to verify their email.

**Solution**: This is automatically handled. SSO users bypass email verification because SSO providers verify emails. If you still see issues:
- Check that the frontend uses `isEmailVerified` from `useAuth()` hook
- Backend automatically detects SSO based on user ID prefix (e.g., `google-oauth2|...`)

### Role Case Sensitivity Issues
**Problem**: Roles from Auth0 are lowercase but application expects uppercase (e.g., "admin" vs "ADMIN").

**Solution**: The extension normalizes all roles to UPPERCASE automatically. Ensure:
- Your role checks use uppercase: `@PreAuthorize("hasRole('ADMIN')")`
- Frontend checks should also use uppercase

### OAuth2 Provider Conflicts
**Problem**: When using Auth0 with another OAuth2 provider, security configurations conflict.

**Solution**: The extension uses explicit `@Order` annotations and security matchers:
- Auth0 API filter chain has `@Order(1)` and applies to `/api/**` routes
- Default filter chain has `@Order(2)` for other routes
- If adding another OAuth2 provider, ensure proper ordering

### Issuer URI Configuration
**Problem**: Need to customize the Auth0 issuer URI.

**Solution**: The issuer is auto-derived from `AUTH0_DOMAIN`. To override:
- Set `AUTH0_ISSUER_URI=https://custom-domain.auth0.com/`
- If not set, defaults to `https://${AUTH0_DOMAIN}/`

---

## Advanced Configuration

### CORS Configuration for Production

**IMPORTANT**: By default, if `CORS_ALLOWED_ORIGINS` is not configured, the application allows all origins (wildcard) for development convenience. This is **NOT secure for production**.

Before deploying to production, you MUST configure CORS:

```bash
# Set allowed origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://myapp.com,https://app.myapp.com
```

**Features:**
- Automatically includes `www.` variants (e.g., `https://myapp.com` also allows `https://www.myapp.com`)
- Supports multiple origins
- Logs allowed origins at startup

**Example configurations:**

```bash
# Single domain with auto www
CORS_ALLOWED_ORIGINS=https://myapp.com

# Multiple domains
CORS_ALLOWED_ORIGINS=https://myapp.com,https://admin.myapp.com,https://api.myapp.com

# Development with specific ports
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**What happens without CORS_ALLOWED_ORIGINS:**
- Application logs a warning: "⚠️ CORS SECURITY WARNING: No CORS_ALLOWED_ORIGINS configured!"
- All origins are allowed (development mode)
- Credentials are still supported (using `allowedOriginPatterns`)

### User Sync Options

Control how users are synchronized from Auth0 to your database:

| Config | Default | Description |
|--------|---------|-------------|
| `syncUserOnFirstLogin` | `true` | Create local user record on first login |
| `updateUserOnEachLogin` | `false` | Update user profile from Auth0 on every login |

Runtime override:
- `AUTH0_SYNC_CREATE_USER=true/false`
- `AUTH0_SYNC_UPDATE_USER=true/false`

### SSO Detection

The extension detects SSO vs email/password login based on user ID prefix:
- `auth0|...` = Email/password login
- `google-oauth2|...` = Google SSO
- `github|...` = GitHub SSO
- `facebook|...` = Facebook SSO
- etc.

Backend code:
```java
boolean isSsoLogin = !auth0UserId.startsWith("auth0|");
```

Frontend code:
```typescript
const { isSsoUser, authProvider } = useAuth();
// isSsoUser: true if logged in via SSO
// authProvider: "auth0", "google-oauth2", "github", etc.

---

## Testing Your Configuration

After setting up Auth0:

1. **Test Login Flow**:
   - Run your application
   - Click the login button
   - You should be redirected to Auth0 login page
   - After logging in, you should be redirected back to your app

2. **Test API Authentication**:
   - Try accessing a protected API endpoint
   - The request should include an authentication token
   - The backend should validate the token with Auth0

3. **Test Logout**:
   - Click logout button
   - You should be logged out from Auth0
   - Protected pages should redirect to login

---

## Additional Resources

- **Auth0 Documentation**: https://auth0.com/docs
- **Auth0 React SDK**: https://auth0.com/docs/libraries/auth0-react
- **Auth0 Spring Boot**: https://auth0.com/docs/quickstart/backend/java-spring-security5
- **Auth0 Dashboard**: https://manage.auth0.com

## Support

If you need help:
- Check Auth0 Community: https://community.auth0.com
- Review Auth0 Documentation: https://auth0.com/docs
- Contact Auth0 Support (paid plans): https://support.auth0.com
