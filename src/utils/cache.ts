import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(__dirname, '../../.cache');

export async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(cacheDir, { recursive: true });
}

export async function readCache(key: string): Promise<string | null> {
  await ensureCacheDir();
  try {
    const content = await fs.readFile(join(cacheDir, key), 'utf8');
    return content;
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: string): Promise<void> {
  await ensureCacheDir();
  await fs.writeFile(join(cacheDir, key), value, 'utf8');
}
