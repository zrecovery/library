import type { ChapterService } from "@library/domain/chapters";
import { chapterDetail as detail } from "@library/domain-services";
import type { Config } from "@library/domain-services/config";
import { connectDb } from "@library/infrastructure";
import { createChapterStore } from "@library/infrastructure/chapters";

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
