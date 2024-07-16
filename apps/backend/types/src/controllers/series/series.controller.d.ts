import Elysia from "elysia";
export declare const SeriesModel: Elysia<"", false, {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    type: {
        readonly "series.list-query": {
            page?: number | undefined;
            size?: number | undefined;
        };
        readonly "series.list": {
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
        readonly "series.params": {
            id: number;
        };
        readonly "series.findById": {
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
    error: {};
}, {
    schema: {};
    macro: {};
}, {}, {
    derive: {};
    resolve: {};
    schema: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
}>;
export declare const SeriesController: Elysia<"", false, {
    decorator: {
        readonly SeriesService: import("../../services/series.service").SeriesService;
    };
    store: {};
    derive: {};
    resolve: {};
}, {
    type: {
        readonly "series.list-query": {
            page?: number | undefined;
            size?: number | undefined;
        };
        readonly "series.list": {
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
        readonly "series.params": {
            id: number;
        };
        readonly "series.findById": {
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
    error: {};
}, {
    schema: {};
    macro: {};
}, {
    series: {
        index: {
            get: {
                body: unknown;
                params: Record<never, string>;
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
}, {
    derive: {};
    resolve: {};
    schema: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
}>;
