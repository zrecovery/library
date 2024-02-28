export interface QueryResult<T> {
  paging?: {
    total: number;
    size: number;
    page: number;
  };
  detail: T;
}
