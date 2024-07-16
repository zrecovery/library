import type { Query } from "@src/interfaces/query";
import type { ISeriesDetail, PaginatedResponse } from "@src/interfaces/response.interface";
import type { Series } from "@src/model";
import type { ArticleRepository } from "@src/repositories/article.repository.port";
import type { ArticleAuthorRelationshipRepository, AuthorRepository } from "@src/repositories/author.repository.port";
import type { ChapterRepository, SeriesRepository } from "@src/repositories/series.repository.port";
export declare class SeriesService {
    #private;
    constructor(articleRepository: ArticleRepository, authorRepository: AuthorRepository, authorArticleRepository: ArticleAuthorRelationshipRepository, seriesRepository: SeriesRepository, chapterRepository: ChapterRepository);
    list: (query: Query) => Promise<PaginatedResponse<Required<Series>[]>>;
    findById: (id: number) => Promise<ISeriesDetail>;
}
