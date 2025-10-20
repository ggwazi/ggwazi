import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, needsRehash } from './index.js';

describe('auth password hashing', () => {
  it('hashes and verifies password (scrypt)', () => {
    const hashed = hashPassword('supersecret');
    expect(hashed.startsWith('scrypt$')).toBe(true);
    expect(verifyPassword('supersecret', hashed)).toBe(true);
    expect(verifyPassword('wrong', hashed)).toBe(false);
    expect(needsRehash(hashed)).toBe(false);
  });

  it('detects legacy pbkdf2 and verifies/rehash-needed', async () => {
    // Legacy format salt:hash (simulate a pre-migration stored value)
    const legacySalt = 'abc123';
    const { pbkdf2Sync } = await import('node:crypto');
    const legacyHash = pbkdf2Sync('supersecret', legacySalt, 100_000, 64, 'sha512').toString('hex');
    const legacyStored = `${legacySalt}:${legacyHash}`;
    expect(verifyPassword('supersecret', legacyStored)).toBe(true);
    expect(needsRehash(legacyStored)).toBe(true);
  });
});
