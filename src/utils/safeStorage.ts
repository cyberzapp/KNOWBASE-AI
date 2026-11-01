// In-memory memory fallback when localStorage is unavailable (e.g. Node / Vitest runner)
const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore[key] || null;
      }
    }
    return memoryStore[key] || null;
  },

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        memoryStore[key] = value;
      }
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        delete memoryStore[key];
      }
    }
    delete memoryStore[key];
  }
};

