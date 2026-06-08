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
  current: Accessor<number>;
  pages: Accessor<number>;
  change: Setter<number>;
}

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
