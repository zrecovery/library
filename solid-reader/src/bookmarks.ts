/**
 * Bookmark / reading progress module.
 *
 * Stores bookmarks in localStorage (or could be adapted for IndexedDB).
 * Each bookmark saves a cursor position in the text.
 */

export interface Bookmark {
  /** Unique ID (timestamp-based) */
  readonly id: string;
  /** Character position in the text */
  readonly cursor: number;
  /** Position as percentage of total length */
  readonly percent: number;
  /** User-visible label */
  readonly label: string;
  /** When the bookmark was created */
  readonly createdAt: number;
}

const STORAGE_KEY = "solid-reader-bookmarks";

/**
 * Read / write a typed value from localStorage, handling parse errors.
 */
function persistJSON<T>(key: string): {
  get: () => T | null;
  set: (value: T) => void;
} {
  return {
    get() {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    set(value: T) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // storage full or disabled — silently ignore
      }
    },
  };
}

const storedBookmarks = persistJSON<Bookmark[]>(STORAGE_KEY);

function getStoredBookmarks(): Bookmark[] {
  return storedBookmarks.get() ?? [];
}

/**
 * Get all saved bookmarks, sorted by cursor position.
 */
export function getBookmarks(): Bookmark[] {
  return getStoredBookmarks().sort((a, b) => a.cursor - b.cursor);
}

/**
 * Add a new bookmark at the given position.
 */
export function addBookmark(
  cursor: number,
  contentLength: number,
  label?: string,
): Bookmark {
  const bookmarks = getStoredBookmarks();
  const percent =
    contentLength > 0 ? Math.round((cursor / contentLength) * 10000) / 100 : 0;

  const bookmark: Bookmark = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    cursor,
    percent,
    label: label || `${percent}%`,
    createdAt: Date.now(),
  };

  bookmarks.push(bookmark);
  storedBookmarks.set(bookmarks);
  return bookmark;
}

/**
 * Remove a bookmark by ID.
 */
export function removeBookmark(id: string): void {
  const bookmarks = getStoredBookmarks().filter((b) => b.id !== id);
  storedBookmarks.set(bookmarks);
}

/**
 * Clear all bookmarks.
 */
export function clearBookmarks(): void {
  storedBookmarks.set([]);
}
