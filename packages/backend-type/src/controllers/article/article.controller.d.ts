import { Elysia } from "elysia";
export declare const ArticleController: Elysia<
	"",
	false,
	{
		decorator: {
			readonly ArticleService: import("../../services/article.service").ArticleService;
		};
		store: {};
		derive: {};
		resolve: {};
	},
	{
		type: {
			readonly "article.id": {
				id: number;
			};
			readonly "article.findById": {
				detail: {
					order?: number | undefined;
					authors?:
						| {
								id: number;
								name: string;
						  }[]
						| undefined;
					series?:
						| {
								id: number;
								title: string;
						  }
						| undefined;
					id: number;
					title: string;
					body: string;
					created_at: Date;
					updated_at: Date;
				};
			};
			readonly "article.list-query": {
				page?: number | undefined;
				size?: number | undefined;
			};
			readonly "article.list": {
				detail: {
					order?: number | undefined;
					authors?:
						| {
								id: number;
								name: string;
						  }[]
						| undefined;
					series?:
						| {
								id: number;
								title: string;
						  }
						| undefined;
					id: number;
					title: string;
					body: string;
				}[];
				pagination: {
					size: number;
					items: number;
					pages: number;
					current: number;
				};
			};
		};
		error: {};
	},
	{
		schema: {};
		macro: {};
		macroFn: {};
	},
	{
		articles: {
			":id": {
				get: {
					body: unknown;
					params: {
						id: number;
					};
					query: unknown;
					headers: unknown;
					response: {
						200: {
							detail: {
								order?: number | undefined;
								authors?:
									| {
											id: number;
											name: string;
									  }[]
									| undefined;
								series?:
									| {
											id: number;
											title: string;
									  }
									| undefined;
								id: number;
								title: string;
								body: string;
								created_at: Date;
								updated_at: Date;
							};
						};
					};
				};
			};
		} & {
			index: {
				get: {
					body: unknown;
					params: {};
					query: {
						page?: number | undefined;
						size?: number | undefined;
					};
					headers: unknown;
					response: {
						200: {
							detail: {
								order?: number | undefined;
								authors?:
									| {
											id: number;
											name: string;
									  }[]
									| undefined;
								series?:
									| {
											id: number;
											title: string;
									  }
									| undefined;
								id: number;
								title: string;
								body: string;
							}[];
							pagination: {
								size: number;
								items: number;
								pages: number;
								current: number;
							};
						};
					};
				};
			};
		};
	},
	{
		derive: {};
		resolve: {};
		schema: {};
	},
	{
		derive: {};
		resolve: {};
		schema: {};
	}
>;
