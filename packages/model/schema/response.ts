export interface PaginationDetail {
	pages: number;
	items: number;
	size: number;
	current: number;
}

export interface Pagination {
	page?: number;
	size?: number;
}

export interface Query extends Pagination {
	keyword?: string;
}
export interface Response<T> {
	detail: T;
}

export interface PaginatedResponse<T> {
	pagination: PaginationDetail;
	detail: T;
}

export interface Response<T> {
	detail: T;
}
