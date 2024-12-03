import type { ArticleCreate } from "../../schema/create";

export interface Save {
  save(data: ArticleCreate): Promise<void>;
}



