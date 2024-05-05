import { seriesService } from "@src/application/ioc.service";
import Elysia, { t } from "elysia";

export const SeriesModel = new Elysia({ name: "Model.Series" })
    .model({
        "series.list-query": t.Object({
            page: t.Optional(t.Numeric()),
            size: t.Optional(t.Numeric()),
        }),
        "series.list": t.Object({
            detail: t.Array(t.Object({
                id: t.Number(),
                title: t.String(),
            })),
            pagination: t.Object({
                pages: t.Number(),
                size: t.Number(),
                items: t.Number(),
                current: t.Number()
            })
        }),
        "series.params": t.Object({
            id:t.Numeric()
        }),
        "series.findById": t.Object({
            id: t.Number(),
            title: t.String(),
            articles: t.Array(t.Object({
                id: t.Number(),
                title: t.String(),
                order: t.Optional(t.Number())
            })),
            authors: t.Array(t.Object({
                id: t.Number(),
                name: t.String(),
                created_at: t.Date(),
                updated_at: t.Date()
            }))
        })
    })

export const SeriesController = new Elysia()
    .use(SeriesModel)
    .decorate({
        SeriesService: seriesService
    })
    .group("/series", (app) => app
        .get("/", async ({ SeriesService, query }) => {
            const result = await SeriesService.list(query);
            return result;
        },
            {
                query: "series.list-query",
                response: "series.list",
            })
            .get("/:id", async ({ SeriesService, params }) => {
                const result = await SeriesService.findById(params.id);
                return result;
            },{
                params: "series.params",
                response: "series.findById",
            }
        )
    )