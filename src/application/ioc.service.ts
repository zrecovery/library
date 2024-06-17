import { PrismaClient } from "@prisma/client";
import { ArticlesAuthorsRelationPrismaRepository } from "@src/repositories/prisma/article-author/articles_authors_relation.repository";
import { ArticlePrismaRepository } from "@src/repositories/prisma/article/article.prisma.repository";
import { AuthorPrismaRepository } from "@src/repositories/prisma/author/author.repository";
import { ChapterPrismaRepository } from "@src/repositories/prisma/chapter/chapter.repository";
import { SeriesPrismaRepository } from "@src/repositories/prisma/series/series.repository";
import { ArticleService } from "@src/services/article.service";
import { AuthorSerivce } from "@src/services/author.service";
import { SeriesService } from "@src/services/series.service";

const client = new PrismaClient();

const articleRepository = new ArticlePrismaRepository(client);

const authorRepository = new AuthorPrismaRepository(client);

const authorArticleRelationshipRepository =
  new ArticlesAuthorsRelationPrismaRepository(client);

const seriesRepository = new SeriesPrismaRepository(client);

const chapterRepository = new ChapterPrismaRepository(client);

const repository = {
  articleRepository: articleRepository,
  authorRepository: authorRepository,
  authorArticleRepository: authorArticleRelationshipRepository,
  seriesRepository: seriesRepository,
  chapterRepository: chapterRepository,
};

export const articleService = new ArticleService(repository);

export const seriesService = new SeriesService(
  articleRepository,
  authorRepository,
  authorArticleRelationshipRepository,
  seriesRepository,
  chapterRepository,
);

export const authorService = new AuthorSerivce(
  authorRepository,
  articleRepository,
  seriesRepository,
  authorArticleRelationshipRepository,
  chapterRepository,
);

export const iocService = () => {
  articleService;
};
