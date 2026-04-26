import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { openDB } from "idb";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

const DB_NAME = "reader-db";
const STORE = "pages";
const CURRENTSTORE = "current";
const VERSION = 10;

const db = await openDB(DB_NAME, VERSION, {
  upgrade(db) {
    if (db.objectStoreNames.contains(STORE)) {
      db.deleteObjectStore(STORE);
    }

    if (db.objectStoreNames.contains(CURRENTSTORE)) {
      db.deleteObjectStore(CURRENTSTORE);
    }

    db.createObjectStore(STORE);
    db.createObjectStore(CURRENTSTORE);
  },
});

export const getCache = async (key: string) => {
  const tx = db.transaction(STORE, "readonly");
  const result = await tx.objectStore(STORE).get(key);

  try {
    if (!result) return Ok([]);
    const typed = Value.Parse(Type.Array(Type.Integer()), result);
    return Ok(typed);
  } catch (e) {
    return Err(new TaggedError(`读取idx失败：${e}`, "UnknownError"));
  }
};

export const setCache = async (key: string, value: number[]) => {
  const tx = db.transaction(STORE, "readwrite");
  await tx.objectStore(STORE).put(value, key);
  await tx.done;
};

export const setCurrentPageCache = async (key: string, value: number) => {
  const tx = db.transaction(CURRENTSTORE, "readwrite");
  await tx.objectStore(CURRENTSTORE).put(value, key);
  await tx.done;
};

export const getCurrentPageCache = async (key: string) => {
  const tx = db.transaction(CURRENTSTORE, "readonly");
  const result = await tx.objectStore(CURRENTSTORE).get(key);

  try {
    if (result === undefined) return Ok(0);
    const typed = Value.Parse(Type.Integer(), result);
    return Ok(typed);
  } catch (e) {
    return Err(new TaggedError(`读取current失败：${e}`, "UnknownError"));
  }
};
