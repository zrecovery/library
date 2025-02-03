import { type Accessor, mergeProps } from "solid-js";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export const ListPagination = (props: {
  page: Accessor<number>;
  setPage: (page: number) => void;
  count: number;
}) => {
  const { page, setPage, count } = mergeProps(props);
  return (
    <div
      class="justify-center max-w-full"
      style="grid-area: pagination; align-content: center;"
    >
      <Pagination
        page={page()}
        onPageChange={setPage}
        count={count}
        itemComponent={(props) => (
          <PaginationItem page={props.page}>{props.page}</PaginationItem>
        )}
        ellipsisComponent={() => <PaginationEllipsis />}
      >
        <PaginationPrevious />
        <PaginationItems />
        <PaginationNext />
      </Pagination>
    </div>
  );
};
