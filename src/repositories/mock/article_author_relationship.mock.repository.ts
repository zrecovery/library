import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { ArticleAuthorRelationship } from "@src/model";
import type { ArticleAuthorRelationshipRepository } from "../author.repository.port";

export class ArticleAuthorRelationshipMockRepository
	implements ArticleAuthorRelationshipRepository
{
	getById(
		id: number,
		query?: Record<string, string | number | string[] | undefined> | undefined,
	): Promise<Required<ArticleAuthorRelationship>> {
		throw new Error("Method not implemented.");
	}
	create(
		created: Creatable<ArticleAuthorRelationship>,
	): Promise<Required<ArticleAuthorRelationship>> {
		throw new Error("Method not implemented.");
	}
	update(
		id: number,
		updated: Partial<ArticleAuthorRelationship>,
	): Promise<Required<ArticleAuthorRelationship>> {
		throw new Error("Method not implemented.");
	}
	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}
	list(
		query?: Query | undefined,
	): Promise<PaginatedResponse<Required<ArticleAuthorRelationship>[]>> {
		throw new Error("Method not implemented.");
	}
}
