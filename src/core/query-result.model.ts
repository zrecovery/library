export interface QueryResult<T> {
  page: number;
  size: number;
  current_page: number;
  detail: T;
}
