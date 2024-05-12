import { PrismaClient } from "@prisma/client";
import { BaseRepository } from "@src/repositories/base.repository.port";
import { ArticleMockRepository } from "@src/repositories/mock/article.mock.repository";
import { ArticleAuthorRelationshipMockRepository } from "@src/repositories/mock/article_author_relationship.mock.repository";
import { AuthorMockRepository } from "@src/repositories/mock/author.mock.repository";
import { ChapterMockRepository } from "@src/repositories/mock/chapter.mock.repository";
import { SeriesMockRepository } from "@src/repositories/mock/series.mock.repository";
import { ArticleSAuthorsRelationPrismaRepository } from "@src/repositories/prisma/article-author/articles_authors_relation.repository";
import { ArticlePrismaRepository } from "@src/repositories/prisma/article/article.prisma.repository";
import { AuthorPrismaRepository } from "@src/repositories/prisma/author/author.repository";
import { ChapterPrismaRepository } from "@src/repositories/prisma/chapter/chapter.repository";
import { SeriesPrismaRepository } from "@src/repositories/prisma/series/series.repository";
import { ChapterRepository } from "@src/repositories/series.repository.port";
import { ArticleService } from "@src/services/article.service";
import { AuthorSerivce } from "@src/services/author.service";
import { SeriesService } from "@src/services/series.service";

const client = new PrismaClient();
const createRepository = <T>(
  prodRepository: new (client: PrismaClient) => BaseRepository<T>,
  mockRepository: new () => BaseRepository<T>,
): BaseRepository<T> => {
  return process.env.NODE_ENV === "production" || process.env.DB_ENV === "prod"
    ? new prodRepository(client)
    : new mockRepository();
};

const articleRepository = createRepository(
  ArticlePrismaRepository,
  ArticleMockRepository,
);

const authorRepository = createRepository(
  AuthorPrismaRepository,
  AuthorMockRepository,
);

const authorArticleRelationshipRepository = createRepository(
  ArticleSAuthorsRelationPrismaRepository,
  ArticleAuthorRelationshipMockRepository,
);

const seriesRepository = createRepository(
  SeriesPrismaRepository,
  SeriesMockRepository,
);

const chapterRepository = createRepository(
  ChapterPrismaRepository,
  ChapterMockRepository,
);

export const articleService = new ArticleService(
  articleRepository,
  authorRepository,
  authorArticleRelationshipRepository,
  seriesRepository,
  chapterRepository,
);

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
