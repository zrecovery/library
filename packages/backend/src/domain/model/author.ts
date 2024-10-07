import type { ArticleBasic } from "./article";
import type { ChapterBasic } from "./chapter";
// 文件名: packages/backend/src/domain/model/author.ts
import type { Id, Identity } from "./common";
import type { PersonProps } from "./person";

// 作者的基本信息
export type AuthorBasic = Readonly<Identity & PersonProps>;

// 作者的详细信息
export type AuthorDetail = Readonly<
  AuthorBasic & {
    chapters: ReadonlyArray<ChapterBasic>;
    articles: ReadonlyArray<ArticleBasic>;
  }
>;
