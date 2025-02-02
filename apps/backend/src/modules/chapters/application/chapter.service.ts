import type { ChapterService } from "@chapters/domain/interfaces";
import { detail } from "@chapters/domain/services/detail";
import { createChapterStore } from "@chapters/infrastructure/store";
import type { Config } from "@shared/domain/config";
import { connectDb } from "@shared/infrastructure/store/connect";
import { createContextLogger } from "@utils/logger";

export const createChapterService = (config: Config): ChapterService => {
  const uri = config.database.URI;

  const db = connectDb(uri);
  const store = createChapterStore(db);

  const logger = createContextLogger("ChapterService");

  const chapterFindService = detail(logger, store);

  const chapterService = {
    detail: chapterFindService,
  };

  return chapterService;
};
