/**
 * IndexedDB 存储 — 用于持久化书籍内容和阅读进度。
 *
 * 数据库："reader-db" 版本 12
 * 对象仓库 "books"：key = bookId, value = { id, title, text, cursor, updatedAt }
 *
 * 错误处理：所有 IndexedDB 操作返回 Promise。底层事务/请求的拒绝会传播给调用方，
 * 本模块自身不重试也不打印日志 — 调用方负责处理存储错误（如弹出提示、回退到内存状态）。
 *
 * IndexedDB storage for books and reading progress.
 *
 * Database: "reader-db" version 12
 * Store "books": key = bookId, value = { id, title, text, cursor, updatedAt }
 *
 * Error handling: all IndexedDB operations return Promises.  Rejections from
 * the underlying transaction / request are propagated to the caller, but the
 * module itself does not retry or log — it is the caller's responsibility to
 * handle storage errors (e.g. show a toast, fall back to in-memory state).
 */

const DB_NAME = "reader-db";
const DB_VERSION = 12;
const STORE_NAME = "books";

interface BookRecord {
  id: string;
  title: string;
  text: string;
  cursor: number;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      // If the store already exists with an incompatible schema, drop and recreate
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * 打开一个事务并执行回调函数。封装了"打开数据库 → 开启事务 → 获取对象仓库"的样板代码，
 * 减少各操作函数中的重复逻辑。回调接收 store 和 tx 两个参数，返回值作为 Promise 结果。
 *
 * Open a transaction on the book store and run the callback.
 * Reduces repetitive db → tx → store boilerplate.
 */
async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore, tx: IDBTransaction) => Promise<T>,
): Promise<T> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  return fn(store, tx);
}

/**
 * 列出所有已保存的书籍（仅元数据，不含全文），按更新时间倒序排列。
 *
 * Load all saved books (metadata only, no full text).
 */
export async function listBooks(): Promise<Omit<BookRecord, "text">[]> {
  return withStore("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const books = (request.result as BookRecord[]).map(
          ({ id, title, cursor, updatedAt }) => ({
            id,
            title,
            cursor,
            updatedAt,
          }),
        );
        books.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(books);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * 保存一本书的全文和阅读进度（新增或覆盖已有记录）。
 *
 * Save a book and its reading progress.
 */
export async function saveBook(
  id: string,
  title: string,
  text: string,
  cursor: number,
): Promise<void> {
  return withStore("readwrite", (store, tx) => {
    return new Promise((resolve, reject) => {
      const record: BookRecord = {
        id,
        title,
        text,
        cursor,
        updatedAt: Date.now(),
      };
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

/**
 * 仅更新阅读进度（光标位置），不改变书籍文本内容。
 *
 * Update only the cursor (reading progress).
 */
export async function updateCursor(id: string, cursor: number): Promise<void> {
  return withStore("readwrite", (store, tx) => {
    return new Promise((resolve, reject) => {
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const record = getReq.result as BookRecord | undefined;
        if (record) {
          record.cursor = cursor;
          record.updatedAt = Date.now();
          store.put(record);
        }
      };
      getReq.onerror = () => reject(getReq.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

/**
 * 加载完整的书籍记录（含全文）。
 *
 * Load a full book record.
 */
export async function loadBook(id: string): Promise<BookRecord | undefined> {
  return withStore("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () =>
        resolve(request.result as BookRecord | undefined);
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * 根据 ID 删除一本书及其所有关联数据。
 *
 * Delete a book.
 */
export async function deleteBook(id: string): Promise<void> {
  return withStore("readwrite", (store, tx) => {
    return new Promise((resolve, reject) => {
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}
