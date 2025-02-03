import { ArticleEdenRepository } from "./articles";
import { AuthorEdenRepository } from "./authors";
import { ChapterEdenRepository } from "./chapters";

export const articleRepository = new ArticleEdenRepository();
export const authorRepository = new AuthorEdenRepository();
export const chapterRepository = new ChapterEdenRepository();
