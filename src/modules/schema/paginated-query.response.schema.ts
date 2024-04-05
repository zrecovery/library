import { PaginateResponseDto } from "./pagination.schema";

export interface PaginatedResponseDto<T> {
  pagination: PaginateResponseDto;
  detail: T[];
}
