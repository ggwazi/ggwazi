import { request } from 'undici';
import { readCache, writeCache } from './cache.js';

export async function getWithOfflineCache(url: string, cacheKey: string, ttlMs = 5 * 60_000): Promise<string> {
  try {
    const res = await request(url);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const text = await res.body.text();
      await writeCache(cacheKey, JSON.stringify({ ts: Date.now(), text }));
      return text;
    }
    throw new Error(`HTTP ${res.statusCode}`);
  } catch (_err) {
    const cached = await readCache(cacheKey);
    if (!cached) throw _err;
    const { ts, text } = JSON.parse(cached) as { ts: number; text: string };
    if (Date.now() - ts <= ttlMs) {
      return text;
    }
    throw _err;
  }
}
