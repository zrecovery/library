import Elysia from "elysia";
declare const app: Elysia<
	"",
	false,
	{
		decorator: {};
		store: {};
		derive: {};
		resolve: {};
	},
	{
		type: {};
		error: {};
	},
	{
		schema: {};
		macro: {};
		macroFn: {};
	},
	{
		valueOf: () => boolean;
		api: {
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
		} & {
			series: {
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
									title: string;
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
						query: unknown;
						headers: unknown;
						response: {
							200: {
								id: number;
								title: string;
								authors: {
									id: number;
									name: string;
									created_at: Date;
									updated_at: Date;
								}[];
								articles: {
									order?: number | undefined;
									id: number;
									title: string;
								}[];
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
export type Server = typeof app;
export {};
