import { AuthorBasePrismaRepository } from "./author/author";
import { ArticleBasePrismaRepository } from "./article/article.prisma.base.repository";
import { PersonBasePrismaRepository } from "./person/person.repository";
import { ChapterBasePrismaRepository } from "./chapter/chapter.repository";
import { DetailBasePrismaRepository } from "./detail/detail.prisma.base.repository";
import { SeriesBasePrismaRepository } from "./series/series.repository";
import type { PrismaClient } from "@prisma/client";

export interface BasePrismaRepos {
	person: PersonBasePrismaRepository;
	article: ArticleBasePrismaRepository;
	author: AuthorBasePrismaRepository;
	series: SeriesBasePrismaRepository;
	chapter: ChapterBasePrismaRepository;
	detail: DetailBasePrismaRepository;
}

export const basePrismaRepo = (client: PrismaClient): BasePrismaRepos => ({
	person: new PersonBasePrismaRepository(client),
	article: new ArticleBasePrismaRepository(client),
	author: new AuthorBasePrismaRepository(client),
	series: new SeriesBasePrismaRepository(client),
	chapter: new ChapterBasePrismaRepository(client),
	detail: new DetailBasePrismaRepository(client),
});
