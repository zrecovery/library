// 文件名: packages/backend/src/domain/model/chapter.ts

import type { ArticleBasic } from "./article";
import type { Id, Identity } from "./common";

// 章节信息
export type Chapter = Readonly<{
  title: string;
  order: number;
}>;

// 章节的基本信息
export type ChapterBasic = Readonly<Identity & Chapter>;

// 章节的详细信息
export type ChapterDetail = Readonly<
  ChapterBasic & {
    articles: ReadonlyArray<ArticleBasic>;
  }
>;
