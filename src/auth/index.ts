import { z } from 'zod';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const CredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

// Format: algo$salt$hash  e.g. scrypt$<hexsalt>$<hexhash>
const CURRENT_ALGO = 'scrypt';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const passwordWithPepper = applyPepper(password);
  const hash = crypto.scryptSync(passwordWithPepper, salt, 64, { N: 2 ** 14 }) as Buffer;
  return `${CURRENT_ALGO}$${salt.toString('hex')}$${Buffer.from(hash).toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.includes('$')) {
    const [algo, saltHex, storedHashHex] = stored.split('$');
    if (algo !== 'scrypt' || !saltHex || !storedHashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const passwordWithPepper = applyPepper(password);
    const hash = crypto.scryptSync(passwordWithPepper, salt, 64, { N: 2 ** 14 }) as Buffer;
    return crypto.timingSafeEqual(hash, Buffer.from(storedHashHex, 'hex'));
  }
  // Legacy PBKDF2 fallback support (salt:hash)
  if (stored.includes(':')) {
    const [legacySalt, legacyHash] = stored.split(':');
    if (!legacySalt || !legacyHash) return false;
    const pbkdf2 = crypto.pbkdf2Sync(password, legacySalt, 100_000, 64, 'sha512');
    return crypto.timingSafeEqual(pbkdf2, Buffer.from(legacyHash, 'hex'));
  }
  return false;
}

export function needsRehash(stored: string): boolean {
  return !stored.startsWith(`${CURRENT_ALGO}$`);
}

function applyPepper(password: string): string {
  return env.AUTH_PEPPER ? `${password}${env.AUTH_PEPPER}` : password;
}

export function validateCredentials(input: unknown): Credentials {
  return CredentialsSchema.parse(input);
}
