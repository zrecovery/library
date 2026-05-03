import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { openDB } from "idb";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

// ── 数据库配置 ──────────────────────────────────────────────
const DB_NAME = "reader-db";
const STORE = "pages";
const CURRENTSTORE = "current";
const VERSION = 10;

/** 阅读器缓存错误标签 */
export const ReaderCacheErrorTag = {
  ParseError: "ParseError",
  NotFound: "NotFound",
} as const;

export type ReaderCacheErrorTag =
  (typeof ReaderCacheErrorTag)[keyof typeof ReaderCacheErrorTag];

// ── 数据库实例（模块级单例，IndexedDB 连接可跨组件复用） ──
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

/**
 * 从缓存中读取分页索引数组。
 *
 * @param key - 缓存键（由排版参数生成）
 * @returns Ok(number[]) 命中缓存；Ok([]) 未缓存；Err 解析失败
 */
export const getCache = async (
  key: string,
): Promise<Result<number[], TaggedError<ReaderCacheErrorTag>>> => {
  const tx = db.transaction(STORE, "readonly");
  const result = await tx.objectStore(STORE).get(key);

  try {
    if (!result) return Ok([]);
    const typed = Value.Parse(Type.Array(Type.Integer()), result);
    return Ok(typed);
  } catch (e) {
    return Err(
      new TaggedError(`读取分页缓存失败：${e}`, ReaderCacheErrorTag.ParseError),
    );
  }
};

/**
 * 将分页索引数组写入缓存。
 *
 * @param key   - 缓存键
 * @param value - 分页起始行号数组
 */
export const setCache = async (key: string, value: number[]): Promise<void> => {
  const tx = db.transaction(STORE, "readwrite");
  await tx.objectStore(STORE).put(value, key);
  await tx.done;
};

/**
 * 缓存当前阅读到的页码。
 *
 * @param key   - 缓存键
 * @param value - 当前页码（从 0 开始）
 */
export const setCurrentPageCache = async (
  key: string,
  value: number,
): Promise<void> => {
  const tx = db.transaction(CURRENTSTORE, "readwrite");
  await tx.objectStore(CURRENTSTORE).put(value, key);
  await tx.done;
};

/**
 * 从缓存中读取上次阅读到的页码。
 *
 * @param key - 缓存键
 * @returns Ok(number) 上次页码（未缓存时为 0）；Err 解析失败
 */
export const getCurrentPageCache = async (
  key: string,
): Promise<Result<number, TaggedError<ReaderCacheErrorTag>>> => {
  const tx = db.transaction(CURRENTSTORE, "readonly");
  const result = await tx.objectStore(CURRENTSTORE).get(key);

  try {
    if (result === undefined) return Ok(0);
    const typed = Value.Parse(Type.Integer(), result);
    return Ok(typed);
  } catch (e) {
    return Err(
      new TaggedError(`读取页码缓存失败：${e}`, ReaderCacheErrorTag.ParseError),
    );
  }
};
