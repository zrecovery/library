import type { Id } from "../../../domain/model";

export type ChapterCreate = {
  article_id: Id;
  series_id: Id;
  order: number;
};


