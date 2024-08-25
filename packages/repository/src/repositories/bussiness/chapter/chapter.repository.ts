import { ChapterRepository } from "domain/repository.port";
import { Series, ArticleDetail } from "model/domain";
import { Query, PaginatedResponse } from "model/schema";
import { BasePrismaRepos } from "src/repositories/base/base";

export class ChapterPrismaRepository implements ChapterRepository {
	#base: BasePrismaRepos;
	constructor(base: BasePrismaRepos) {
		this.#base = base;
	}
	findMany = (query: Query): Promise<PaginatedResponse<Series[]>> =>
		this.#base.series.findMany(query);

	find = async (
		query: Query & { id: number },
	): Promise<PaginatedResponse<Series & { articles: ArticleDetail[] }>> => {
		const series = await this.#base.series.find({ id: query.id });
		const articles = await this.#base.detail.findMany({
			size: query.size,
			page: query.page,
			series_id: query.id,
		});
		series.articles = articles;
		return series;
	};
}
