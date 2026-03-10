// Google OAuth 2.0 Authentication — Browser-compatible version
// Uses implicit grant flow (no CORS issues) with popup for better UX
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ');

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken?: string;
}

// Use implicit flow — returns access_token directly in the URL hash
// This avoids CORS issues with token exchange from the browser
export function initiateGoogleLogin() {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI);
  // Use 'token' response type for implicit flow (no server needed)
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('scope', SCOPES);
  authUrl.searchParams.append('include_granted_scopes', 'true');
  // Add state param for security
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('google_oauth_state', state);
  authUrl.searchParams.append('state', state);
  
  window.location.href = authUrl.toString();
}

// Handle the callback from implicit flow (token in URL hash fragment)
export async function handleImplicitCallback(hash: string): Promise<GoogleUser> {
  // Parse the hash fragment: #access_token=...&token_type=...&expires_in=...
  const params = new URLSearchParams(hash.substring(1)); // Remove leading #
  const accessToken = params.get('access_token');
  const tokenType = params.get('token_type');
  const expiresIn = params.get('expires_in');
  const error = params.get('error');

  if (error) {
    throw new Error(`Google auth error: ${error}`);
  }

  if (!accessToken) {
    throw new Error('No access token received from Google');
  }

  // Get user info using the access token
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user info from Google');
  }

  const userInfo = await userResponse.json();

  const googleUser: GoogleUser = {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
    accessToken: accessToken,
  };

  // Store tokens
  localStorage.setItem('google_access_token', accessToken);
  if (expiresIn) {
    const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
    localStorage.setItem('google_token_expiry', expiryTime.toString());
  }
  localStorage.setItem('google_user', JSON.stringify(googleUser));

  return googleUser;
}

// Legacy handler for authorization_code flow (kept for backwards compatibility)
export async function handleGoogleCallback(code: string): Promise<GoogleUser> {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      throw new Error(tokens.error_description || 'Failed to get access token');
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userResponse.json();

    const googleUser: GoogleUser = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    localStorage.setItem('google_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('google_refresh_token', tokens.refresh_token);
    }
    localStorage.setItem('google_user', JSON.stringify(googleUser));

    return googleUser;
  } catch (error) {
    console.error('Error handling Google callback:', error);
    throw error;
  }
}

export function getStoredGoogleUser(): GoogleUser | null {
  const userStr = localStorage.getItem('google_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getGoogleAccessToken(): string | null {
  const token = localStorage.getItem('google_access_token');
  if (!token) return null;

  // Check if token has expired
  const expiry = localStorage.getItem('google_token_expiry');
  if (expiry && Date.now() > parseInt(expiry)) {
    // Token expired, clear it
    clearGoogleAuth();
    return null;
  }

  return token;
}

export function clearGoogleAuth() {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
  localStorage.removeItem('google_token_expiry');
  localStorage.removeItem('google_user');
  localStorage.removeItem('google_oauth_state');
}

export function isGoogleAuthenticated(): boolean {
  return !!getGoogleAccessToken();
}
