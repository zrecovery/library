import { ArticleDetail, Series } from "model/domain";
import { PaginatedResponse, Query } from "model/schema";
import { Repositories } from "repository.port";

class ChapterService {
	#repo: Repositories;
	constructor(repo: Repositories) {
		this.#repo = repo;
	}

	find = async (
		query: Query & { id: number },
	): Promise<PaginatedResponse<Series & { articles: ArticleDetail[] }>> =>
		this.#repo.chapter.find(query);

	findMany = async (query: Query): Promise<PaginatedResponse<Series[]>> =>
		this.#repo.chapter.findMany(query);
}
