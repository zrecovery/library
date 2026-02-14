import type { getMaterializedViewConfig } from "drizzle-orm/pg-core";
import type { Result } from "result";

interface Query {
  positive: string[];
  negative: string[];
}

interface Count {
  key: string;
  articleId: number;
  total: number;
}

enum SearchErrorTag {
  StoreError = "Store Error",
}

export class BaseSearchError extends Error {
  constructor(
    message: string,
    public readonly _tag: SearchErrorTag,
    public readonly raw?: Error,
  ) {
    super(`${message}\n${raw ? raw.message : ""}`);
  }
}

export class StoreSearchError extends BaseSearchError {
  constructor(message: string, raw?: Error) {
    super(message, SearchErrorTag.StoreError, raw);
  }
}

// 搜索
// 1、建立索引，预设一批词语作为热词，扫描全部文件，记录每个文件中热词出现次数；
const findAll = (text: string, keyword: string): string[] => {
  const matches: string[] = [];
  let start = 0;

  while (true) {
    const idx = text.indexOf(keyword, start);
    if (idx === -1) break;
    matches.push(keyword);
    start = idx + keyword.length;
  }

  return matches;
};

const matchCounts = (
  keywords: string[],
  text: string,
): Record<string, number> =>
  keywords.reduce(
    (acc, kw) => ({ ...acc, [kw]: findAll(text, kw).length }),
    Object.fromEntries(keywords.map((k) => [k, 0])),
  );

interface Article {
  id: number;
  path: string;
}

interface Store {
  getIndexByKeyword: (keyword: string) => Promise<Count>;
  insertIndex: (
    articleId: number,
    keyword: string,
    count: Count,
  ) => Promise<Result<void, StoreSearchError>>;
  updateIndexByArticle: (
    articleId: number,
    keyword: string,
    count: Count,
  ) => Promise<Result<void, StoreSearchError>>;
  getArticles: () => Promise<Result<Article[], StoreSearchError>>;
  saveIndex: (
    index: Record<string, number>,
    articleId: number,
  ) => Promise<Result<void, StoreSearchError>>;
  getKeywords: () => Promise<Result<string[], StoreSearchError>>;
}

interface FileHandler {
  readFilePath: (articleId: number) => AsyncIterable<URL>;
  getArticleContent: (articleId: number) => Promise<string>;
}

const createSingleIndex = async (
  articleId: number,
  keywords: string[],
  store: Store,
  filer: FileHandler,
) => {
  const content = await filer.getArticleContent(articleId);
  const result = matchCounts(keywords, content);
  return store.saveIndex(result, articleId);
};

const initIndex = async (store: Store) => {
  const articles = await store.getArticles();
  const keywords = await store.getKeywords();

  const articleResult = await bulkMap(articles, createSingleIndex, keywords, 8);
  return await Promise.all(articleResult);
};

// 2、根据用户输入词汇，将用户输入词汇拆分为n-gram，然后在索引中查找匹配项，并将n-gram和匹配结果写入数据库；
// 3、如果新增文件，更新索引，所有热词匹配并记录结果。
interface tmp {
  saveIndex: (counts: Count[]) => Result<void, StoreSearchError>;
  match: (test: string, query: Query) => boolean;
  count: (test: string, query: Query) => number;
  countAll: (test: string, query: Query) => Count[];
  createIndex: (test: string, query: Query) => Result<void, StoreSearchError>;
}
