import { TaggedError } from "tag-error";
import type {
  ChapterDetailFinder,
  ChapterDetailPort,
} from "./port/deps/ChapterDetailFinder";
import {
  ChapterDetailErrorEnum,
  type ChapterDetailResult,
} from "./port/type/findDetail";

export class FindChapterDetailUseCase {
  readonly #chapterDetailFinder: ChapterDetailFinder;
  constructor(chapterDetailFinder: ChapterDetailFinder) {
    this.#chapterDetailFinder = chapterDetailFinder;
  }

  #FinderErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<ChapterDetailErrorEnum> => {
    switch (e.tag) {
      case ChapterDetailErrorEnum.NotFound:
        return new TaggedError(
          e.message,
          ChapterDetailErrorEnum.NotFound,
          e.stack,
        );
      default:
        return new TaggedError(
          e.message,
          ChapterDetailErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  execute = async (port: ChapterDetailPort): Promise<ChapterDetailResult> => {
    const chapterDetailFinderResult =
      await this.#chapterDetailFinder.findDetailById(port);
    return chapterDetailFinderResult
      .map((result) => result)
      .mapErr(this.#FinderErrorHandler);
  };
}
