import { treaty } from "@elysiajs/eden";
import type { App } from "@src/application/app";

const client = treaty<App>("localhost:3001");

const { data: index } = await client.api.articles.index.get({
	query: { page: 1, size: 10 },
});
