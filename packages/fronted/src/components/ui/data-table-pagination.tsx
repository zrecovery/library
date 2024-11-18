import type { Table } from "@tanstack/solid-table";
import { splitProps } from "solid-js";
import { Button } from "~/components/ui/button";

interface A {
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
}
export function DataTablePagination(props: A) {
  const [table] = splitProps(props, [
    "previousPage",
    "nextPage",
    "getCanPreviousPage",
    "getCanNextPage",
  ]);
  return (
    <div class="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}
