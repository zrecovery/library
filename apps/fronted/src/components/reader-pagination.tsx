import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type Accessor, type Setter } from "solid-js";

interface ReaderPaginationProps {
  /** 当前页码（响应式读取） */
  current: Accessor<number>;
  /** 总页数（响应式读取） */
  pages: Accessor<number>;
  /** 页码变更回调 */
  change: Setter<number>;
}

/**
 * 阅读器分页组件 — 对通用 Pagination 组件的封装，
 * 确保 current 和 pages 取值 ≥ 1 并暴露给外部使用。
 */
const ReaderPagination = (props: ReaderPaginationProps) => {
  return (
    <Pagination
      page={props.current() >= 1 ? props.current() : 1}
      count={props.pages() >= 1 ? props.pages() : 1}
      defaultPage={1}
      onPageChange={props.change}
      itemComponent={(itemProps) => (
        <PaginationItem page={itemProps.page}>{itemProps.page}</PaginationItem>
      )}
      ellipsisComponent={() => <PaginationEllipsis />}
    >
      <PaginationPrevious />
      <PaginationItems />
      <PaginationNext />
    </Pagination>
  );
};

export default ReaderPagination;
