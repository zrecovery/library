import type { ArticleAuthorRelationship, Author } from "@src/model";
import { BaseRepository } from "./base.repository.port";

export abstract class AuthorRepository extends BaseRepository<Author> {}

export abstract class ArticleAuthorRelationshipRepository extends BaseRepository<ArticleAuthorRelationship> {}
