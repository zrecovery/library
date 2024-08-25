import { articleService } from "@src/application/ioc.service";
import { Elysia, t } from "elysia";
import { ResponseSchema } from "../response.schema";
import {
	ArticleCreatedRequestDto,
	ArticleDetailSchema,
	ArticlePaginatedHttpDto,
} from "./article.controller.dto";

const ArticleModel = new Elysia({ name: "Model.Article" }).model({
	"article.id": t.Object({ id: t.Numeric() }),
	"article.findById": ResponseSchema(ArticleDetailSchema),
	"article.list-query": t.Optional(
		t.Object({
			page: t.Optional(t.Numeric()),
			size: t.Optional(t.Numeric()),
			//Todo: Elysia don't handle optional string now.
			//keywords: t.Optional(t.String()),
		}),
	),
	"article.create": ArticleCreatedRequestDto,
	"article.list": ArticlePaginatedHttpDto,
});

export const ArticleController = new Elysia()
	.decorate({
		ArticleService: articleService,
	})
	.use(ArticleModel)
	.group("/articles", (app) =>
		app
			.get(
				"/:id",
				async ({ ArticleService, params }) => {
					return ArticleService.findById(params.id);
				},
				{
					params: "article.id",
					response: "article.findById",
				},
			)
			.get(
				"/",
				async ({ ArticleService, query }) => {
					return ArticleService.search(query);
				},
				{
					query: "article.list-query",
					response: "article.list",
				},
			)
			.post(
				"/",
				async ({ ArticleService, body }) => ArticleService.createArticle(body),
				{
					body: "article.create",
				},
			),
	);
