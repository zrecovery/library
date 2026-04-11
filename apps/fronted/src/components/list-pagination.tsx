import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Accessor, Setter } from "solid-js";

interface Page {
  current: Accessor<number>;
  pages: Accessor<number>;
  change: Setter<number>;
}
const ListPagination = (props: Page) => {
  return (
    <Pagination
      page={props.current()}
      count={props.pages()}
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

export default ListPagination;
