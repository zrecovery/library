import { type Static, t } from "elysia";

export const ListQuery = t.Object({
  page: t.Optional(t.Integer({ default: 1 })),
  size: t.Optional(t.Integer({ default: 10 })),
  keyword: t.Optional(t.String()),
});

export type ListQuery = Static<typeof ListQuery>;

export interface CreatedSchema {
  chapter?: {
    title: string;
    order: number;
  };
  title: string;
  body: string;
  author: {
    name: string;
  };
}

export type ChapterMeta = {
  id: number;
  title: string;
};

export type ArticleMeta = {
  chapter?: {
    id: number;
    title: string;
    order: number;
  };
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
};
