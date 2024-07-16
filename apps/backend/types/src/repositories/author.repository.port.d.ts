import type { ArticleAuthorRelationship, Author } from "@src/model";
import { BaseRepository } from "./base.repository.port";
export declare abstract class AuthorRepository extends BaseRepository<Author> {
}
export declare abstract class ArticleAuthorRelationshipRepository extends BaseRepository<ArticleAuthorRelationship> {
}
