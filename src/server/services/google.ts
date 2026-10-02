import { db } from '../database';
import { encryptToken, decryptToken } from '../utils/crypto';

export interface GoogleAccount {
  name: string; // e.g. "accounts/10987654321"
  accountName: string; // Display name
  type?: string;
  role?: string;
}

export interface GoogleDiscoveredLocation {
  google_account_id: string;
  google_location_id: string; // e.g. "locations/123456789" or "accounts/10987/locations/123456"
  business_name: string;
  address: string;
  phone?: string;
  website?: string;
  google_maps_url?: string;
}

export interface GoogleRawReview {
  reviewId: string;
  reviewer: {
    displayName?: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | number;
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface MockGoogleAdapter {
  exchangeCode?: (code: string) => Promise<{ access_token: string; refresh_token?: string; expires_in: number; email?: string; account_id?: string }>;
  getAccounts?: (accessToken: string) => Promise<GoogleAccount[]>;
  getLocations?: (accessToken: string, accountName: string) => Promise<GoogleDiscoveredLocation[]>;
  getReviews?: (accessToken: string, locationId: string, pageToken?: string) => Promise<{ reviews: GoogleRawReview[]; nextPageToken?: string }>;
  replyToReview?: (accessToken: string, locationId: string, reviewId: string, comment: string) => Promise<{ comment: string; updateTime: string }>;
  deleteReply?: (accessToken: string, locationId: string, reviewId: string) => Promise<boolean>;
}

export class GoogleBusinessProfileService {
  private static mockAdapter: MockGoogleAdapter | null = null;

  /**
   * Sets a mock adapter for isolated automated unit/integration tests
   */
  public static setMockAdapter(adapter: MockGoogleAdapter | null) {
    this.mockAdapter = adapter;
  }

  public static isConfigured(): boolean {
    const id = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    return Boolean(
      id &&
      secret &&
      !id.includes('your-google-client-id') &&
      !id.startsWith('mock-') &&
      !secret.includes('your-google-client-secret')
    );
  }

  public static getClientId(): string {
    return process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id';
  }

  public static getClientSecret(): string {
    return process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret';
  }

  public static getRedirectUri(customRedirect?: string): string {
    if (customRedirect) return customRedirect;
    if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${appUrl.replace(/\/$/, '')}/api/v1/integrations/google/callback`;
  }

  /**
   * Builds the official Google OAuth 2.0 consent URL (or instant simulated callback if credentials are not configured yet)
   */
  public static getAuthUrl(state: string, redirectUri?: string): string {
    const resolvedRedirect = this.getRedirectUri(redirectUri);

    // If Google Cloud credentials are not configured yet ("baad me add krengy"), provide instant simulation flow
    if (!this.isConfigured()) {
      return `${resolvedRedirect}?code=mock_code_sandbox_${Date.now()}&state=${encodeURIComponent(state)}`;
    }

    const clientId = this.getClientId();
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: resolvedRedirect,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access and refresh tokens
   */
  public static async exchangeCode(code: string, redirectUri?: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    email?: string;
    account_id?: string;
    scopes?: string[];
  }> {
    if (this.mockAdapter?.exchangeCode) {
      const mockResult = await this.mockAdapter.exchangeCode(code);
      return {
        access_token: mockResult.access_token,
        refresh_token: mockResult.refresh_token || 'mock_refresh_token_xyz',
        expires_in: mockResult.expires_in || 3600,
        email: mockResult.email || 'ahmadfaizan1999@gmail.com',
        account_id: mockResult.account_id || '10987654321',
        scopes: ['https://www.googleapis.com/auth/business.manage', 'openid', 'email', 'profile']
      };
    }

    if (!this.isConfigured() || code.startsWith('mock_')) {
      return {
        access_token: `mock_access_token_${Date.now()}`,
        refresh_token: `mock_refresh_token_${Date.now()}`,
        expires_in: 3600,
        email: 'ahmadfaizan1999@gmail.com',
        account_id: 'accounts/10987654321',
        scopes: ['https://www.googleapis.com/auth/business.manage', 'openid', 'email', 'profile']
      };
    }

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const resolvedRedirect = this.getRedirectUri(redirectUri);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: resolvedRedirect,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Failed to exchange code for tokens (HTTP ${tokenRes.status}): ${errBody}`);
    }

    const tokenData = await tokenRes.json();

    // Fetch user profile info (email and sub) using access token
    let email: string | undefined;
    let account_id: string | undefined;

    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (userRes.ok) {
        const userInfo = await userRes.json();
        email = userInfo.email;
        account_id = userInfo.sub;
      }
    } catch (err) {
      console.warn('[GoogleService] Failed to fetch userinfo:', err);
    }

    const scopes = tokenData.scope ? tokenData.scope.split(' ') : [];

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in || 3600,
      email,
      account_id,
      scopes
    };
  }

  /**
   * Refreshes an expired access token using the refresh token
   */
  public static async refreshAccessToken(encryptedRefreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const plainRefreshToken = decryptToken(encryptedRefreshToken);
    if (!plainRefreshToken) {
      throw new Error('Missing or corrupt refresh token.');
    }

    if (this.mockAdapter || !this.isConfigured() || plainRefreshToken.startsWith('mock_')) {
      return {
        access_token: `mock_refreshed_access_token_${Date.now()}`,
        expires_in: 3600
      };
    }

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: plainRefreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google token refresh failed (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600
    };
  }

  /**
   * Ensures the given Google connection has a valid, non-expired access token.
   * If near expiration (< 5 minutes), automatically refreshes and stores the new encrypted token.
   */
  public static async ensureValidAccessToken(connectionId: string): Promise<string> {
    const connection = db.findGoogleConnectionById(connectionId);
    if (!connection) {
      throw new Error(`Google connection ${connectionId} not found.`);
    }

    if (connection.status === 'disconnected') {
      throw new Error('Google account is disconnected. Please reconnect.');
    }

    // Check expiration
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Token is still valid for > 5 minutes
    if (expiresAt > now + fiveMinutes && connection.access_token) {
      return decryptToken(connection.access_token);
    }

    // Needs refresh
    if (!connection.refresh_token) {
      db.updateGoogleConnection(connectionId, { status: 'expired' });
      throw new Error('Google authorization expired and no refresh token is present. Please re-authorize.');
    }

    try {
      const refreshResult = await this.refreshAccessToken(connection.refresh_token);
      const newExpiresAt = new Date(Date.now() + refreshResult.expires_in * 1000).toISOString();

      db.updateGoogleConnection(connectionId, {
        access_token: encryptToken(refreshResult.access_token),
        token_expires_at: newExpiresAt,
        status: 'active',
        last_used_at: new Date().toISOString()
      });

      return refreshResult.access_token;
    } catch (err: any) {
      db.updateGoogleConnection(connectionId, { status: 'expired' });
      throw new Error(`Google token refresh failed. Please re-authenticate your Google account: ${err.message}`);
    }
  }

  /**
   * Discovers Google Business Profile accounts accessible to the connection
   */
  public static async getAccounts(connectionId: string): Promise<GoogleAccount[]> {
    const accessToken = await this.ensureValidAccessToken(connectionId);

    if (this.mockAdapter?.getAccounts) {
      return this.mockAdapter.getAccounts(accessToken);
    }

    if (!this.isConfigured() || accessToken.startsWith('mock_')) {
      return [
        {
          name: 'accounts/10987654321',
          accountName: 'Faizan Business Group',
          type: 'PERSONAL',
          role: 'OWNER'
        }
      ];
    }

    const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch Google Business accounts (HTTP ${res.status}): ${err}`);
    }

    const data = await res.json();
    const accounts = data.accounts || [];

    return accounts.map((a: any) => ({
      name: a.name, // e.g. "accounts/10987654321"
      accountName: a.accountName || a.name,
      type: a.type,
      role: a.role
    }));
  }

  /**
   * Discovers Google Business Profile locations for connected account(s)
   */
  public static async getLocations(connectionId: string, specificAccountName?: string): Promise<GoogleDiscoveredLocation[]> {
    const accessToken = await this.ensureValidAccessToken(connectionId);

    if (this.mockAdapter?.getLocations) {
      return this.mockAdapter.getLocations(accessToken, specificAccountName || 'accounts/mock');
    }

    if (!this.isConfigured() || accessToken.startsWith('mock_')) {
      return [
        {
          google_account_id: 'accounts/10987654321',
          google_location_id: 'locations/10987654321_01',
          business_name: 'Muzaffarabad azad jamu and kashmir - Domail',
          address: '9F4G+2Q8, Domail Muzaffarabad, Azad Kashmir',
          phone: '+92 5822 443322',
          website: 'https://reviewflowai.in',
          google_maps_url: 'https://maps.google.com/?cid=1234567890'
        },
        {
          google_account_id: 'accounts/10987654321',
          google_location_id: 'locations/10987654321_02',
          business_name: 'ReviewFlow Health & Dental Center',
          address: 'Main Commercial Plaza, Sector 4, Muzaffarabad',
          phone: '+92 5822 998877',
          website: 'https://reviewflowai.in',
          google_maps_url: 'https://maps.google.com/?cid=9876543210'
        }
      ];
    }

    let accountNames: string[] = [];
    if (specificAccountName) {
      accountNames = [specificAccountName];
    } else {
      const accounts = await this.getAccounts(connectionId);
      accountNames = accounts.map((a) => a.name);
    }

    const discovered: GoogleDiscoveredLocation[] = [];

    for (const accountName of accountNames) {
      const readMask = 'name,title,storefrontAddress,phoneNumbers,websiteUri,metadata';
      const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=${readMask}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        console.warn(`[GoogleService] Could not list locations for ${accountName} (HTTP ${res.status})`);
        continue;
      }

      const data = await res.json();
      const locations = data.locations || [];

      for (const loc of locations) {
        const addressLines = loc.storefrontAddress?.addressLines || [];
        const locality = loc.storefrontAddress?.locality || '';
        const region = loc.storefrontAddress?.administrativeArea || '';
        const fullAddress = [addressLines.join(', '), locality, region].filter(Boolean).join(', ');

        const phone = loc.phoneNumbers?.primaryPhone || '';
        const website = loc.websiteUri || '';
        const mapsUrl = loc.metadata?.mapsUri || '';

        discovered.push({
          google_account_id: accountName,
          google_location_id: loc.name, // e.g. "locations/123456"
          business_name: loc.title || 'Untitled Business',
          address: fullAddress || 'Address on file with Google',
          phone: phone || undefined,
          website: website || undefined,
          google_maps_url: mapsUrl || undefined
        });
      }
    }

    return discovered;
  }

  /**
   * Fetches reviews for a given Google location
   */
  public static async getReviews(
    connectionId: string,
    googleLocationId: string,
    pageToken?: string
  ): Promise<{ reviews: GoogleRawReview[]; nextPageToken?: string; totalReviewCount?: number; averageRating?: number }> {
    const accessToken = await this.ensureValidAccessToken(connectionId);

    if (this.mockAdapter?.getReviews) {
      return this.mockAdapter.getReviews(accessToken, googleLocationId, pageToken);
    }

    if (!this.isConfigured() || accessToken.startsWith('mock_')) {
      return {
        reviews: [
          {
            reviewId: 'mock_rev_001',
            reviewer: {
              displayName: 'Tariq Mehmood',
              profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
            },
            starRating: 'FIVE',
            comment: 'Outstanding hospitality and prompt service! Scanned the QR code at reception and was delighted by the experience.',
            createTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            reviewReply: {
              comment: 'Thank you so much Tariq! We look forward to serving you again.',
              updateTime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
            }
          },
          {
            reviewId: 'mock_rev_002',
            reviewer: {
              displayName: 'Dr. Sarah Khan',
              profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            starRating: 'FIVE',
            comment: 'Clean facilities, polite staff, and seamless process throughout. Highly recommended for everyone in the area!',
            createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
          },
          {
            reviewId: 'mock_rev_003',
            reviewer: {
              displayName: 'Bilal Ahmed',
              profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            },
            starRating: 'FOUR',
            comment: 'Great overall experience. Minor wait time during the rush hour, but staff managed everything professionally.',
            createTime: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString()
          },
          {
            reviewId: 'mock_rev_004',
            reviewer: {
              displayName: 'Zainab Fatima',
              profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces'
            },
            starRating: 'FIVE',
            comment: 'The team was very attentive to our needs. Modern atmosphere and very easy digital feedback system.',
            createTime: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
          }
        ],
        totalReviewCount: 4,
        averageRating: 4.8
      };
    }

    // Google My Business v4 endpoint for reviews: accounts/{accountId}/locations/{locationId}/reviews
    // Ensure googleLocationId is properly formatted
    const cleanLocationPath = googleLocationId.startsWith('locations/')
      ? googleLocationId
      : `locations/${googleLocationId}`;

    const url = new URL(`https://mybusiness.googleapis.com/v4/${cleanLocationPath}/reviews`);
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }
    url.searchParams.set('pageSize', '50');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch Google reviews (HTTP ${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      reviews: data.reviews || [],
      nextPageToken: data.nextPageToken,
      totalReviewCount: data.totalReviewCount,
      averageRating: data.averageRating
    };
  }

  /**
   * Publishes or updates an owner reply to a Google review
   */
  public static async replyToReview(
    connectionId: string,
    googleLocationId: string,
    googleReviewId: string,
    replyText: string
  ): Promise<{ comment: string; updateTime: string }> {
    if (!replyText || replyText.trim().length === 0) {
      throw new Error('Reply text cannot be empty.');
    }

    if (replyText.length > 4096) {
      throw new Error('Reply exceeds maximum permitted character length (4096 chars).');
    }

    const accessToken = await this.ensureValidAccessToken(connectionId);

    if (this.mockAdapter?.replyToReview) {
      return this.mockAdapter.replyToReview(accessToken, googleLocationId, googleReviewId, replyText);
    }

    if (!this.isConfigured() || accessToken.startsWith('mock_')) {
      return {
        comment: replyText.trim(),
        updateTime: new Date().toISOString()
      };
    }

    const cleanLocationPath = googleLocationId.startsWith('locations/')
      ? googleLocationId
      : `locations/${googleLocationId}`;

    const cleanReviewId = googleReviewId.replace(/^reviews\//, '');
    const url = `https://mybusiness.googleapis.com/v4/${cleanLocationPath}/reviews/${cleanReviewId}/reply`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment: replyText.trim() })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google rejected review reply (HTTP ${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      comment: data.comment || replyText.trim(),
      updateTime: data.updateTime || new Date().toISOString()
    };
  }

  /**
   * Deletes an owner reply from a Google review
   */
  public static async deleteReviewReply(
    connectionId: string,
    googleLocationId: string,
    googleReviewId: string
  ): Promise<boolean> {
    const accessToken = await this.ensureValidAccessToken(connectionId);

    if (this.mockAdapter?.deleteReply) {
      return this.mockAdapter.deleteReply(accessToken, googleLocationId, googleReviewId);
    }

    if (!this.isConfigured() || accessToken.startsWith('mock_')) {
      return true;
    }

    const cleanLocationPath = googleLocationId.startsWith('locations/')
      ? googleLocationId
      : `locations/${googleLocationId}`;

    const cleanReviewId = googleReviewId.replace(/^reviews\//, '');
    const url = `https://mybusiness.googleapis.com/v4/${cleanLocationPath}/reviews/${cleanReviewId}/reply`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok && res.status !== 404) {
      const err = await res.text();
      throw new Error(`Failed to delete Google review reply (HTTP ${res.status}): ${err}`);
    }

    return true;
  }
}
