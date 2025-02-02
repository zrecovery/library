import type { Id, NotFoundError, UnknownError } from "@shared/domain";
import type { Result } from "result";
import type { ChapterDetail } from "../types";

export interface ChapterService {
  detail: (
    id: Id,
  ) => Promise<Result<ChapterDetail, NotFoundError | UnknownError>>;
}
