import type { ArticleCreate } from "@article/domain/types/create";

export interface Save {
  save(data: ArticleCreate): Promise<void>;
}
