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

function getStoredBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Bookmark[];
  } catch {
    return [];
  }
}

function setStoredBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // storage full or disabled — silently ignore
  }
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
  setStoredBookmarks(bookmarks);
  return bookmark;
}

/**
 * Remove a bookmark by ID.
 */
export function removeBookmark(id: string): void {
  const bookmarks = getStoredBookmarks().filter((b) => b.id !== id);
  setStoredBookmarks(bookmarks);
}

/**
 * Clear all bookmarks.
 */
export function clearBookmarks(): void {
  setStoredBookmarks([]);
}
