import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

export interface Finder {
  find(
    id: number,
  ): Promise<Result<string, NotFoundStoreError | UnknownStoreError>>;
}

const t = async (store: Finder) => {
  const r = await store.find(1);

  return r.match({
    ok: (article) => {
      return article;
    },
    err: (error) => {
      return error;
    },
  });
};
