// 文件名: packages/backend/src/domain/model/article.ts

import type { Chapter, ChapterBasic } from "./chapter";
import type { Id, Identity, PaginatedResponse } from "./common";
import type { PersonProps } from "./person";

// 文章的基本属性
export type ArticleProps = Readonly<{
  title: string;
  body: string;
}>;

// 文章的基本信息
export type ArticleBasic = Readonly<Identity & ArticleProps>;

// 创建文章所需的信息
export type CreateArticle = Readonly<
  Pick<ArticleProps, "title" | "body"> & {
    chapter?: Chapter;
    author: PersonProps;
  }
>;

// 更新文章所需的信息
export type UpdateArticle = Readonly<
  Partial<Pick<ArticleProps, "title" | "body">> & {
    id: Id;
    chapter?: {
      title: string;
      order?: number;
    };
    author?: {
      name: string;
    };
  }
>;

// 文章列表
export type ArticleList = PaginatedResponse<ReadonlyArray<ArticleBasic>>;

// 文章的详细信息
export type ArticleDetail = Readonly<
  ArticleBasic & {
    author: Identity & PersonProps;
    chapter?: ChapterBasic;
  }
>;
