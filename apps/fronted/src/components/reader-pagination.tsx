import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ErrorBoundary, Show, type Accessor, type Setter } from "solid-js";

interface Page {
  current: Accessor<number>;
  pages: Accessor<number>;
  change: Setter<number>;
}
const ReaderPagination = (props: Page) => {
  return (
    <Pagination
      page={props.current() >= 1 ? props.current() : 1}
      count={props.pages() >= 2 ? props.pages() - 1 : 1}
      defaultPage={1}
      onPageChange={props.change}
      itemComponent={(props) => (
        <PaginationItem page={props.page}>{props.page}</PaginationItem>
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
