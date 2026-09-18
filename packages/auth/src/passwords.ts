import crypto from 'node:crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Strong password hashing using Node crypto.scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    crypto.scrypt(password, salt, KEY_LENGTH, (err: Error | null, derivedKey: Buffer) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Validates candidate password against hashed scrypt string
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = hash.split(':');
    if (parts.length !== 2) return resolve(false);

    const [salt, key] = parts;
    const keyBuffer = Buffer.from(key, 'hex');

    crypto.scrypt(password, salt, KEY_LENGTH, (err: Error | null, derivedKey: Buffer) => {
      if (err) return resolve(false);
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
}

/**
 * Generates a cryptographically secure random token for password resets
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes a secure SHA-256 hash of a reset token for safe database persistence
 */
export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}


