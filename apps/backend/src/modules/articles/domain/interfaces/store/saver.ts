import type { ArticleCreate } from "@articles/domain/types/create";

export interface Saver {
  save(data: ArticleCreate): Promise<void>;
}
