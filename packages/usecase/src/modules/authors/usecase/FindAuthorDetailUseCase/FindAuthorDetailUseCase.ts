import { TaggedError } from "tag-error";
import type {
  AuthorDetailFinder,
  AuthorDetailPort,
} from "./port/deps/AuthorDetailFinder";
import {
  AuthorDetailErrorEnum,
  type AuthorDetailResult,
  type AuthorDetailResultPort,
} from "./port/type/findDetail";

export class FindAuthorDetailUseCase {
  readonly #authorDetailFinder: AuthorDetailFinder;
  constructor(authorDetailFinder: AuthorDetailFinder) {
    this.#authorDetailFinder = authorDetailFinder;
  }

  #FinderErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<AuthorDetailErrorEnum> => {
    switch (e.tag) {
      case AuthorDetailErrorEnum.NotFound:
        return new TaggedError(
          e.message,
          AuthorDetailErrorEnum.NotFound,
          e.stack,
        );
      default:
        return new TaggedError(
          e.message,
          AuthorDetailErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  execute = async (port: AuthorDetailPort): Promise<AuthorDetailResult> => {
    const authorDetailFinderResult =
      await this.#authorDetailFinder.findDetailById(port);
    return authorDetailFinderResult
      .map((result: AuthorDetailResultPort) => result)
      .mapErr(this.#FinderErrorHandler);
  };
}
