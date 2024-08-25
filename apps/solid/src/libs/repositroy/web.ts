import { treaty } from "@elysiajs/eden";
import type { Server } from "backend/types/src/application/app";

const client = treaty<Server>("http://0.0.0.0:3001/");

export const getArticleDetail = (id: number) => client.api.articles({ id: id });

export const getArticles = (query: {
	page?: number;
	size?: number;
	keyword?: string;
}) => client.api.articles.index.get({ query });

export const getSeries = (query: { page?: number; size?: number }) =>
	client.api.series.index.get({ query });

export const getSeriesDetail = (id: number) => client.api.series({ id: id });
