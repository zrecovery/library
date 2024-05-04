import { PageQuery, Query } from "@src/interfaces/query";
import {
  IAuthorResponse,
  IAuthorsResponse,
} from "@src/interfaces/response.interface";
import { ArticleRepository } from "@src/repositories/article.repository.port";
import {
  ArticleAuthorRelationshipRepository,
  AuthorRepository,
} from "@src/repositories/author.repository.port";
import {
  ChapterRepository,
  SeriesRepository,
} from "@src/repositories/series.repository.port";

export class AuthorSerivce {
  #authorRepository: AuthorRepository;
  #articleRepository: ArticleRepository;
  #seriesRepository: SeriesRepository;
  #authorArticleRepository: ArticleAuthorRelationshipRepository;
  #chapterRepository: ChapterRepository;

  constructor(
    authorRepository: AuthorRepository,
    articleRepository: ArticleRepository,
    seriesRepository: SeriesRepository,
    authorArticleRepository: ArticleAuthorRelationshipRepository,
    chapterRepository: ChapterRepository,
  ) {
    this.#authorRepository = authorRepository;
    this.#articleRepository = articleRepository;
    this.#seriesRepository = seriesRepository;
    this.#authorArticleRepository = authorArticleRepository;
    this.#chapterRepository = chapterRepository;
  }

  getById = async (id: number, query: PageQuery): Promise<IAuthorResponse> => {
    const author = await this.#authorRepository.getById(id);
    const articles = await this.#articleRepository.list({
      author_id: id,
      ...query,
    });

    const series = await this.#seriesRepository.list({
      author_id: id,
      ...query,
    });

    const result: IAuthorResponse = {
      detail: {
        ...author,
        articles: articles,
        series: series,
      },
    };

    return result;
  };

  list = async (query: Query): Promise<IAuthorsResponse> => {
    return this.#authorRepository.list(query);
  };

  delete = async (id: number): Promise<void> => {
    //删除文章与作者的关联
    const authorsArticles = await this.#authorArticleRepository.list({
      article_id: id,
      size: -1,
    });
    const authorRelatedIds = authorsArticles.detail.map(
      (related) => related.id,
    );
    await Promise.all(
      authorRelatedIds.map(async (id) => {
        await this.#authorArticleRepository.delete(id);
      }),
    );

    //删除文章与系列的关联
    const chapters = await this.#chapterRepository.list({
      article_id: id,
      size: -1,
    });
    const chaptersRelatedIds = chapters.detail.map((related) => related.id);
    await Promise.all(
      chaptersRelatedIds.map(async (id) => {
        await this.#chapterRepository.delete(id);
      }),
    );

    await this.#authorRepository.delete(id);
  };
}
