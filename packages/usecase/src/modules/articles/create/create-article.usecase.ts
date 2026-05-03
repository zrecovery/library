import type { ArticleSaver } from "./port/deps/ArticleSaver";
import type { AuthorSaver } from "./port/deps/AuthorSaver";
import {
  ArticleCreateErrorEnum,
  ArticleCreatePort,
  type ArticleCreateResult,
} from "./port/type/create";
import { Ok, Err, type Result } from "result";
import type { ChapterSaver } from "./port/deps/ChapterSaver";
import { TaggedError } from "tag-error";
import type { SearchHandler } from "./port/deps/SearchHandler";
import { Value } from "@sinclair/typebox/value";
import type { Id } from "@library/domain";
import type { Rollbackable } from "@shared/rollbackable";

/**
 * 将来自底层 Saver 的 TaggedError<T> 统一映射为 UseCase 层的
 * ArticleCreateErrorEnum。未来可按需在此 switch 中添加更细粒度的映射。
 */
const mapToArticleCreateError = <T>(
  e: TaggedError<T>,
): TaggedError<ArticleCreateErrorEnum> => {
  switch (e.tag) {
    // 暂时所有底层错误都映射为 UnknownError；后续可扩展 case 分支
    default:
      return new TaggedError(
        e.message,
        ArticleCreateErrorEnum.UnknownError,
        e.stack,
      );
  }
};

/**
 * 为一个返回 Result<U, E> 的 async 操作附加 rollback 能力：
 * - 若操作成功 (Ok)，直接透传值
 * - 若操作失败 (Err)，先执行 savepoint.rollback()，再用 mapper 映射错误
 *
 * 这消除了每个步骤里重复的 `if (x.isErr()) { rollback(); return Err(...) }` 样板。
 */
const withRollback = <U, E, F>(
  savepoint: Rollbackable,
  mapper: (e: E) => F,
) => {
  return async (result: Result<U, E>): Promise<Result<U, F>> => {
    if (result.isOk()) return Ok(result.unwrap());

    const err = result.unwrapErr();
    await savepoint.rollback();
    return Err(mapper(err));
  };
};

/**
 * 创建文章的用例（UseCase / Interactor）
 *
 * 采用函数式管道风格组织业务流程：
 *   输入校验 → 保存文章 → (可选)保存章节 → 保存作者 → 建立搜索索引
 *
 * 每一步失败时自动回滚对应资源，并把底层错误映射为用例层统一错误。
 */
export class CreateArticleUseCase {
  readonly #articleSaver: ArticleSaver;
  readonly #authorSaver: AuthorSaver;
  readonly #chapterSaver: ChapterSaver;
  readonly #searchHandler: SearchHandler;

  constructor(
    articleSaver: ArticleSaver,
    authorSaver: AuthorSaver,
    chapterSaver: ChapterSaver,
    searchHandler: SearchHandler,
  ) {
    this.#articleSaver = articleSaver;
    this.#authorSaver = authorSaver;
    this.#chapterSaver = chapterSaver;
    this.#searchHandler = searchHandler;
  }

  execute = async (port: ArticleCreatePort): Promise<ArticleCreateResult> => {
    // ── 0. 输入校验：不合法直接返回 Err ──
    if (!Value.Check(ArticleCreatePort, port)) {
      return Err(
        new TaggedError("Invalid input", ArticleCreateErrorEnum.InvalidInput),
      );
    }

    // ── 1. 保存文章本体 ──
    const articleResult = await this.#articleSaver
      .save(port)
      .then(withRollback(this.#articleSaver, mapToArticleCreateError));

    if (articleResult.isErr()) return articleResult;
    const articleId: Id = articleResult.unwrap();

    // ── 2. (可选) 保存章节 ──
    if (port.chapter) {
      const chapterResult = await this.#chapterSaver
        .save({ articleId, ...port.chapter })
        .then(withRollback(this.#chapterSaver, mapToArticleCreateError));

      if (chapterResult.isErr()) return chapterResult;
    }

    // ── 3. 保存作者 ──
    const authorResult = await this.#authorSaver
      .save({ articleId, ...port.author })
      .then(withRollback(this.#authorSaver, mapToArticleCreateError));

    if (authorResult.isErr()) return authorResult;

    // ── 4. 建立搜索索引 ──
    // index 返回 Result<null, ...>，.map(() => articleId) 将其转为 Result<Id, ...>
    const indexResult = await this.#searchHandler
      .index(articleId, port.body)
      .then(withRollback(this.#searchHandler, mapToArticleCreateError))
      .then((r) => r.map(() => articleId));

    if (indexResult.isErr()) return indexResult;

    // ── 5. 全部成功 ──
    return indexResult;
  };
}
