import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Returns a 32-byte encryption key derived from environment or secure fallback.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.APP_ENCRYPTION_KEY || process.env.JWT_SECRET || 'reviewflow-ai-default-encryption-salt-2026';
  // Derive uniform 32-byte key via SHA-256
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypts sensitive string data (OAuth tokens, refresh tokens) using AES-256-GCM.
 * Output format: <hex_iv>:<hex_auth_tag>:<hex_ciphertext>
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH
  });

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts encrypted token string back to plain text.
 * Throws an error if payload is tampered with or key is invalid.
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return '';

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format.');
  }

  const [ivHex, authTagHex, cipherTextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
