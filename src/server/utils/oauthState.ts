import crypto from 'crypto';

interface OAuthStateRecord {
  userId: string;
  expiresAt: number; // Unix timestamp ms
  used: boolean;
}

// In-memory store for active states with automatic purging
const activeStates = new Map<string, OAuthStateRecord>();

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Periodically purge expired states from memory
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of activeStates.entries()) {
    if (record.expiresAt < now || record.used) {
      activeStates.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generates a signed, cryptographically random, single-use state token associated with a specific user.
 */
export function generateOAuthState(userId: string): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + STATE_TTL_MS;

  const rawPayload = `${userId}:${now}:${randomBytes}`;
  const secret = process.env.JWT_SECRET || 'reviewflow-oauth-state-secret-2026';
  const signature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

  const stateToken = `${Buffer.from(rawPayload).toString('base64url')}.${signature}`;

  activeStates.set(stateToken, {
    userId,
    expiresAt,
    used: false
  });

  return stateToken;
}

/**
 * Validates the state token:
 * 1. Checks signature integrity
 * 2. Checks expiration
 * 3. Verifies user ID association
 * 4. Ensures single-use (anti-replay)
 */
export function validateOAuthState(stateToken: string, expectedUserId?: string): { valid: boolean; userId?: string; error?: string } {
  if (!stateToken || typeof stateToken !== 'string') {
    return { valid: false, error: 'Missing or invalid state parameter.' };
  }

  const parts = stateToken.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed state token.' };
  }

  const [encodedPayload, signature] = parts;
  let rawPayload = '';
  try {
    rawPayload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return { valid: false, error: 'Failed to decode state payload.' };
  }

  const secret = process.env.JWT_SECRET || 'reviewflow-oauth-state-secret-2026';
  const expectedSig = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

  if (signature !== expectedSig) {
    return { valid: false, error: 'Invalid state signature. Potential tampering detected.' };
  }

  const payloadParts = rawPayload.split(':');
  if (payloadParts.length < 3) {
    return { valid: false, error: 'Invalid state format.' };
  }

  const [userId, timestampStr] = payloadParts;
  const createdAt = Number(timestampStr);

  if (Date.now() - createdAt > STATE_TTL_MS) {
    activeStates.delete(stateToken);
    return { valid: false, error: 'State token has expired. Please initiate Google connection again.' };
  }

  // Check in-memory store for replay protection
  const record = activeStates.get(stateToken);
  if (!record || record.used) {
    return { valid: false, error: 'State token has already been consumed or is not recognized (anti-replay).' };
  }

  if (expectedUserId && record.userId !== expectedUserId) {
    return { valid: false, error: 'OAuth state does not match the authenticated session.' };
  }

  // Mark as used
  record.used = true;
  activeStates.delete(stateToken);

  return { valid: true, userId: record.userId };
}
