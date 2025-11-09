import type { Config } from "src/shared/domain/config";
import { connectDb } from "src/shared/infrastructure/store/connect";
import type { ChapterService } from "../domain";
import { detail } from "../domain/services/detail";
import { createChapterStore } from "../infrastructure/store";

export const createChapterService = (config: Config): ChapterService => {
  const db = connectDb(config);
  const store = createChapterStore(db);

  const logger = console;

  const chapterFindService = detail(logger, store);

  const chapterService = {
    detail: chapterFindService,
  };

  return chapterService;
};
