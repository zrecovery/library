import Elysia from "elysia";
export declare const AuthorController: Elysia<
	"",
	false,
	{
		decorator: {
			readonly AuthorService: import("../../services/author.service").AuthorSerivce;
		};
		store: {};
		derive: {};
		resolve: {};
	},
	{
		type: {
			readonly "author.list-query": {
				page?: number | undefined;
				size?: number | undefined;
			};
			readonly "author.list": {
				detail: {
					id: number;
					name: string;
				}[];
				pagination: {
					size: number;
					items: number;
					pages: number;
					current: number;
				};
			};
			readonly "author.params": {
				id: number;
			};
			readonly "author.findById": {};
		};
		error: {};
	},
	{
		schema: {};
		macro: {};
		macroFn: {};
	},
	{
		authors: {
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
								id: number;
								name: string;
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
		} & {
			":id": {
				get: {
					body: unknown;
					params: {
						id: number;
					};
					query: {
						page?: number | undefined;
						size?: number | undefined;
					};
					headers: unknown;
					response: {
						200: {};
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
