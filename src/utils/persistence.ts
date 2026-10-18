// SciNexa State Persistence Engine
// Safely preserves student and teacher lab states across accidental browser closes, reloads, or power cuts

const STORAGE_PREFIX = 'scinexa_v2_';

export function saveState<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (e) {
    // Graceful degrade if quota exceeded or disabled
  }
}

export function loadState<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    return fallback;
  }
}

export function clearAllSavedState(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}
