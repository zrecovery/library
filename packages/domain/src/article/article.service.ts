import type { Query } from "model/schema";
import type { Repositories } from "../../repository.port";
import type { ArticleCreated, ArticleUpdated } from "model/domain";

export class ArticleService {
	#repo: Repositories;

	constructor(repositories: Repositories) {
		this.#repo = repositories;
	}

	findById = (id: number) => this.#repo.article.find({ id });

	search = async (query: Query) => this.#repo.article.findMany(query);

	delete = (id: number) => this.#repo.article.delete(id);

	create = (data: ArticleCreated) => this.#repo.article.create(data);

	update = (id: number, data: ArticleUpdated) =>
		this.#repo.article.update(id, data);
}
