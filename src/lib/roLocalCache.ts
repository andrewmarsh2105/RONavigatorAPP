/**
 * src/lib/roLocalCache.ts
 *
 * IndexedDB read-cache for RO snapshots.
 *
 * After every successful server fetch the full RO list is written here so the
 * app can display meaningful data when the device is offline or the network is
 * unreachable.  This is intentionally separate from offlineQueue.ts (write
 * queue) — this is a pure read cache; it never drives mutations.
 *
 * Key behaviours:
 *  - Writes are fire-and-forget; failures are logged but never throw.
 *  - Reads return null rather than throwing so callers can fall back gracefully.
 *  - Each snapshot is keyed by userId so multi-account devices stay isolated.
 */

import type { RepairOrder } from '@/types/ro';

const CACHE_DB_NAME = 'ro-local-cache';
const CACHE_DB_VERSION = 1;
const RO_STORE = 'ro_snapshots';

interface ROSnapshot {
  userId: string;       // keyPath — one snapshot per user
  ros: RepairOrder[];
  savedAt: string;      // ISO 8601 timestamp of the last successful fetch
}

function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RO_STORE)) {
        db.createObjectStore(RO_STORE, { keyPath: 'userId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Persist the current RO list. Called after every successful server fetch and
 * after optimistic local mutations (add / update / delete) so the cache always
 * reflects what the user last saw.
 */
export async function saveROsToCache(userId: string, ros: RepairOrder[]): Promise<void> {
  try {
    const db = await openCacheDB();
    const snapshot: ROSnapshot = { userId, ros, savedAt: new Date().toISOString() };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RO_STORE, 'readwrite');
      tx.objectStore(RO_STORE).put(snapshot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Cache failures are non-fatal — the app still works, it just won't have
    // offline read access until the next successful write.
    console.warn('[roLocalCache] save failed:', err);
  }
}

/**
 * Return the most recent RO snapshot for this user, or null if nothing has
 * been cached yet (e.g. first install or after a cache clear).
 */
export async function loadROsFromCache(
  userId: string,
): Promise<{ ros: RepairOrder[]; savedAt: string } | null> {
  try {
    const db = await openCacheDB();
    const result = await new Promise<ROSnapshot | undefined>((resolve, reject) => {
      const tx = db.transaction(RO_STORE, 'readonly');
      const req = tx.objectStore(RO_STORE).get(userId);
      req.onsuccess = () => resolve(req.result as ROSnapshot | undefined);
      req.onerror = () => reject(req.error);
    });
    return result ? { ros: result.ros, savedAt: result.savedAt } : null;
  } catch (err) {
    console.warn('[roLocalCache] load failed:', err);
    return null;
  }
}

/**
 * Remove the snapshot for this user (e.g. after a deliberate sign-out or
 * when the user manually clears app data).  The cache is keyed by userId so
 * leaving it in place is also safe — another user cannot read it.
 */
export async function clearROsCache(userId: string): Promise<void> {
  try {
    const db = await openCacheDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RO_STORE, 'readwrite');
      tx.objectStore(RO_STORE).delete(userId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[roLocalCache] clear failed:', err);
  }
}
