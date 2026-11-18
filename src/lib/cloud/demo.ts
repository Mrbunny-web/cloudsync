import type { CloudFile, CloudFolder } from "./types";
import { SEED_FOLDERS, createSeedFiles } from "./seed";

const STATE_KEY = "cloudsync.demo.state.v2";
const LEGACY_STATE_KEY = "cloudsync.demo.state.v1";
const DB_NAME = "cloudsync-demo";
const STORE = "blobs";

export const DEMO_EMAIL = "demo@cloudsync.app";
export const DEMO_NAME = "Alex Rivera";

export type DemoAccount = {
  email: string;
  name: string;
  salt: string;
  hash: string;
  createdAt: string;
};

export type DemoDrive = {
  files: CloudFile[];
  folders: CloudFolder[];
};

export type DemoState = {
  accounts: DemoAccount[];
  sessionEmail: string | null;
  drives: Record<string, DemoDrive>;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emptyDrive(): DemoDrive {
  return { files: [], folders: [] };
}

export function seedDrive(now = Date.now()): DemoDrive {
  return { files: createSeedFiles(now), folders: SEED_FOLDERS };
}

export function defaultDemoState(): DemoState {
  return { accounts: [], sessionEmail: null, drives: {} };
}

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<DemoState>;
  return (
    Array.isArray(state.accounts) &&
    (state.sessionEmail === null || typeof state.sessionEmail === "string") &&
    Boolean(state.drives) &&
    typeof state.drives === "object"
  );
}

type LegacyState = {
  user?: { name?: string; email?: string } | null;
  fullName?: string;
  files?: CloudFile[];
  folders?: CloudFolder[];
};

/** Fold the pre-account demo workspace into the demo account without losing files. */
function migrateLegacyState(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(LEGACY_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacyState;
    if (!Array.isArray(parsed.files) || !Array.isArray(parsed.folders)) return null;

    const name = (parsed.fullName || parsed.user?.name || DEMO_NAME).trim() || DEMO_NAME;
    const account: DemoAccount = {
      email: DEMO_EMAIL,
      name,
      salt: "",
      hash: "",
      createdAt: new Date().toISOString(),
    };

    return {
      accounts: [account],
      sessionEmail: parsed.user ? DEMO_EMAIL : null,
      drives: {
        [DEMO_EMAIL]: {
          files: parsed.files,
          folders: parsed.folders.length ? parsed.folders : SEED_FOLDERS,
        },
      },
    };
  } catch {
    return null;
  }
}

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return defaultDemoState();

  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isDemoState(parsed)) return parsed;
    }
  } catch {
    // Fall through to the legacy shape or a clean state.
  }

  const legacy = migrateLegacyState();
  if (legacy) return legacy;

  return defaultDemoState();
}

export function saveDemoState(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked; the session still works in memory.
  }
}

/* ── Demo account credentials ──────────────────────────────────────── */

export function randomSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * SHA-256 over salt + password. This keeps demo passwords out of plain text in
 * localStorage. It is still a local demo, not a substitute for server auth.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const input = `${salt}:${password}`;

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Non-secure contexts (rare for localhost) get a light fallback hash.
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

/* ── Blob storage (IndexedDB) ───────────────────────────────────────── */

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || typeof window.indexedDB === "undefined") {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }
  return dbPromise;
}

export async function putBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function getBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => resolve(null);
  });
}

export async function deleteBlob(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
