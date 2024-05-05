import {
  IArticleCreateInput,
  IArticleUpdateInput,
} from "@src/interfaces/article.interface";
import {
  IAuthorCreateInput,
  IAuthorUpdateInput,
} from "@src/interfaces/author.interface";
import { Query } from "@src/interfaces/query";
import { IArticleResponse, IPagination } from "@src/interfaces/response.interface";
import {
  ISeriesCreateInput,
  ISeriesUpdateInput,
} from "@src/interfaces/series.interface";
import { Article } from "@src/model";
import { ArticleRepository } from "@src/repositories/article.repository.port";

import {
  ArticleAuthorRelationshipRepository,
  AuthorRepository,
} from "@src/repositories/author.repository.port";
import {
  ChapterRepository,
  SeriesRepository,
} from "@src/repositories/series.repository.port";

export class ArticleService {
  #articleRepository: ArticleRepository;
  #authorRepository: AuthorRepository;
  #seriesRepository: SeriesRepository;
  #chapterRepository: ChapterRepository;
  #authorArticleRepository: ArticleAuthorRelationshipRepository;

  constructor(
    articleRepository: ArticleRepository,
    authorRepository: AuthorRepository,
    authorArticleRepository: ArticleAuthorRelationshipRepository,
    seriesRepository: SeriesRepository,
    chapterRepository: ChapterRepository
  ) {
    this.#articleRepository = articleRepository;
    this.#authorRepository = authorRepository;
    this.#seriesRepository = seriesRepository;
    this.#chapterRepository = chapterRepository;
    this.#authorArticleRepository = authorArticleRepository;
  }

  findById = async (id: number): Promise<IArticleResponse> => {
    const article = await this.#articleRepository.getById(id);
    const authorRelateds = await this.#authorArticleRepository.list({ article_id: id });
    const authors = await Promise.all(
      authorRelateds.detail.map(async (authorRelated) => {
        const author = await this.#authorRepository.getById(authorRelated.author_id);
        return author;
      })
    )
    const chapters = await this.#chapterRepository.list({ article_id: id });
    const chapter = chapters.detail[0];
    const series = await this.#seriesRepository.getById(chapters.detail[0].series_id);
    const result = { detail: { ...article, authors, series, order: chapter?.order } };
    return result;
  };

  search = async (
    query: Query,
  ): Promise<{ detail: Required<Article>[]; pagination: IPagination }> => {
    return this.#articleRepository.list(query);
  };

  createArticle = async (
    article: IArticleCreateInput,
    authors?: IAuthorCreateInput[],
    chapter?: { series: ISeriesCreateInput; order: number },
  ): Promise<Article> => {
    try {
      // 1、创建文章
      const articleCreated = await this.#articleRepository.create(article);

      // 2、创建并关联作者
      if (authors && authors.length > 0) {
        // 批量创建作者
        const createdAuthors = await Promise.all(
          authors.map(async (authorInput) => {
            const authors = (await this.#authorRepository.list({ name: authorInput.name })).detail;
            if (authors.length === 0) {
              authors.push(await this.#authorRepository.create(authorInput));
            }
            return authors[0];
          }),
        );

        // 批量创建关系记录
        await Promise.all(
          createdAuthors.map(async (author) => {
            await this.#authorArticleRepository.create({
              article_id: articleCreated.id!,
              author_id: author.id!,
            });
          }),
        );
      }

      // 3、创建并关联章节
      if (chapter) {
        let series = (await this.#seriesRepository.list({title:chapter.series.title})).detail[0];
        if (!series) {
          series = await this.#seriesRepository.create(chapter.series);
        }

        // 创建章节
        await this.#chapterRepository.create({
          article_id: articleCreated.id!,
          series_id: series.id!,
          order: chapter.order,
        });
      }

      return articleCreated;
    } catch (error) {
      console.error("创建文章失败：", error);
      throw error;
    }
  };

  updateArticle = async (
    id: number,
    changes: {
      article?: IArticleUpdateInput;
      authors?: IAuthorUpdateInput[];
      chapter?: { series: ISeriesUpdateInput; order?: number };
    },
  ): Promise<void> => {
    try {
      // 检索文章
      const existingArticle = await this.#articleRepository.getById(id);
      const updatedArticle = { ...existingArticle };

      // 更新系列
      if (changes.chapter?.series.title) {
        const series = (await this.#seriesRepository.list({
          title: changes.chapter?.series.title,
        })).detail[0];
        if (!series) {
          // 如果系列不存在，则创建新系列
          const newSeries = await this.#seriesRepository.create({
            title: changes.chapter?.series.title,
          });
          // 创建关系表记录
          await this.#chapterRepository.create({
            article_id: id,
            series_id: newSeries.id!,
            order: changes.chapter.order!,
          });
        } else {
          // 更新关系表记录
          await this.#chapterRepository.update(id, { series_id: series.id });
        }
      }

      // 更新作者
      if (changes.authors) {
        // 清空现有作者
        await this.#authorArticleRepository.delete(id);
        // 根据作者名称列表更新作者
        for (const authorName of changes.authors) {
          const authors = (await this.#authorRepository.list({
            name: authorName.name!,
          })).detail;

          if (authors.length === 0) {
            // 如果作者不存在，则创建新作者
            authors.push(await this.#authorRepository.create({
              name: authorName.name!,
            }));
          }
          // 创建关系表记录
          await Promise.all(authors.map(async (author) => {
            await this.#authorArticleRepository.create({
              author_id: author.id!,
              article_id: id,
            });
          }))

        }
      }

      // 保存修改到数据库
      await this.#articleRepository.update(id, updatedArticle);
    } catch (error) {
      // 处理错误
      console.error("修改文章失败：", error);
      throw error;
    }
  };

  delete = async (id: number): Promise<void> => {
    await this.#articleRepository.delete(id);
  };
}
