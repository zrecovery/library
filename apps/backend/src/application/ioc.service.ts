import { PrismaClient } from "@prisma/client";

import { ArticleService } from "@src/domain/article/article.service";
import { AuthorSerivce } from "@src/domain/author.service";
import { SeriesService } from "@src/domain/series.service";

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
