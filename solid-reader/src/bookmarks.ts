/**
 * 书签 / 阅读进度模块。
 *
 * 使用 localStorage 存储书签（也可适配为 IndexedDB）。
 * 每个书签保存文本中的光标位置、百分比进度和用户标签。
 *
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
 * 泛型 localStorage 读写辅助函数，自动处理 JSON 解析/序列化错误。
 * 读取失败或存储满/禁用时静默返回 null / 忽略写入。
 *
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
 * 获取所有已保存的书签，按光标位置升序排列。
 *
 * Get all saved bookmarks, sorted by cursor position.
 */
export function getBookmarks(): Bookmark[] {
  return getStoredBookmarks().sort((a, b) => a.cursor - b.cursor);
}

/**
 * 在指定光标位置添加一个新书签。自动计算百分比进度，生成唯一 ID。
 *
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
 * 根据 ID 删除一个书签。
 *
 * Remove a bookmark by ID.
 */
export function removeBookmark(id: string): void {
  const bookmarks = getStoredBookmarks().filter((b) => b.id !== id);
  storedBookmarks.set(bookmarks);
}

/**
 * 清空所有书签。
 *
 * Clear all bookmarks.
 */
export function clearBookmarks(): void {
  storedBookmarks.set([]);
}
