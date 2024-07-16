import { authorService } from "@src/application/ioc.service";
import Elysia, { t } from "elysia";

const AuthorModel = new Elysia({ name: "Model.Author" }).model({
	"author.list-query": t.Object({
		page: t.Optional(t.Numeric()),
		size: t.Optional(t.Numeric()),
	}),
	"author.list": t.Object({
		detail: t.Array(
			t.Object({
				id: t.Number(),
				name: t.String(),
			}),
		),
		pagination: t.Object({
			pages: t.Number(),
			size: t.Number(),
			items: t.Number(),
			current: t.Number(),
		}),
	}),
	"author.params": t.Object({
		id: t.Numeric(),
	}),
	"author.findById": t.Object({}),
});

export const AuthorController = new Elysia()
	.decorate({
		AuthorService: authorService,
	})
	.use(AuthorModel)
	.group("/authors", (app) =>
		app
			.get(
				"/",
				async ({ AuthorService, query }) => {
					return AuthorService.list(query);
				},
				{
					query: "author.list-query",
					response: "author.list",
				},
			)
			.get(
				"/:id",
				async ({ AuthorService, params, query }) => {
					const result = await AuthorService.getById(params.id, {
						page: query.page,
						size: query.size,
					});
					return result;
				},
				{
					params: "author.params",
					query: "author.list-query",
					response: "author.findById",
				},
			),
	);
