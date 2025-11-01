# Google OAuth Setup Guide

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity"
   - Enable the "Google Identity" API

## 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" for user type
3. Fill in the required information:
   - App name: "Resume Builder"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes (optional, basic profile info is included by default)
5. Save and continue

## 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Name it "Resume Builder Web Client"
5. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
7. Click "Create"

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.googleusercontent.com
   ```

## 5. Backend API Endpoints Required

Your backend should implement these endpoints:

### POST /api/auth/google
- Accepts: `{ access_token: string, id_token?: string }`
- Returns: `{ user: User, access_token: string, refresh_token?: string }`

### POST /api/auth/login
- Accepts: `{ email: string, password: string }`
- Returns: `{ user: User, access_token: string, refresh_token?: string }`

### POST /api/auth/register
- Accepts: `{ email: string, password: string, name: string }`
- Returns: `{ user: User, access_token: string, refresh_token?: string }`

### POST /api/auth/logout
- Requires: Authorization header with Bearer token
- Returns: `{ message: string }`

### POST /api/auth/refresh
- Accepts: `{ refresh_token: string }`
- Returns: `{ access_token: string, refresh_token?: string }`

### GET /api/auth/profile
- Requires: Authorization header with Bearer token
- Returns: `User` object

## 6. User Object Structure

```typescript
interface User {
    id: string
    email: string
    name: string
    picture?: string
    created_at?: string
    updated_at?: string
}
```

## 7. Testing

1. Start your backend server
2. Start the frontend development server: `npm run dev`
3. Navigate to your app
4. Click "Continue with Google" to test OAuth flow
5. Try traditional email/password registration and login

## Notes

- The Google OAuth button will automatically handle the authentication flow
- JWT tokens are stored in localStorage for persistence
- The app includes automatic token refresh logic
- All API requests automatically include the Bearer token when authenticated