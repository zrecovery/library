// db.ts
const DB_NAME = "reader-db";
const STORE = "pages";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, 2);

    console.error(`[open db]${reject}`);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
}

export async function getCache(key: string) {
  console.log("📖 READ CACHE:", key);

  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);

    req.onsuccess = () => {
      resolve(req.result ?? null);
    };
  });
}
export async function setCache(key: string, value: number[]) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    const req = store.put(value, key);

    req.onsuccess = () => {
      resolve(true);
    };

    req.onerror = (e) => {
      console.error("❌ CACHE FAILED", e);
      reject(e);
    };

    tx.oncomplete = () => {
      d;
    };
  });
}
