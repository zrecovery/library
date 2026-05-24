/**
 * IndexedDB storage for books and reading progress.
 *
 * Database: "reader-db" version 12
 * Store "books": key = bookId, value = { id, title, text, cursor, updatedAt }
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

/** Load all saved books (metadata only, no full text) */
export async function listBooks(): Promise<Omit<BookRecord, "text">[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
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
}

/** Save a book and its reading progress */
export async function saveBook(
  id: string,
  title: string,
  text: string,
  cursor: number,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
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
}

/** Update only the cursor (reading progress) */
export async function updateCursor(id: string, cursor: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
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
}

/** Load a full book record */
export async function loadBook(id: string): Promise<BookRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as BookRecord | undefined);
    request.onerror = () => reject(request.error);
  });
}

/** Delete a book */
export async function deleteBook(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
