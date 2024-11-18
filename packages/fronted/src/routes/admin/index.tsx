import { createSolidTable, getCoreRowModel } from "@tanstack/solid-table";
import { Show, createEffect, createResource, createSignal } from "solid-js";
import { type Cols, columns } from "~/components/columns";
import { DataTable } from "~/components/ui/data-table";
import { DataTablePagination } from "~/components/ui/data-table-pagination";
import { articleRepository } from "~/libs/api";

export default function AdminTable() {
  const data: Cols[] = [];

  const table = createSolidTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  const [page, setPage] = createSignal(1);
  const [size, setSize] = createSignal(10);
  const [keyword, setKeyword] = createSignal<string>("");
  const [result] = createResource(
    () => ({ page: page(), size: size(), keyword: keyword() }),
    articleRepository.list,
  );
  table.setPageSize(size());
  table.setPageIndex(page() - 1);
  table.options.manualPagination = true;
  createEffect(() => {
    table.options.pageCount = result()?.pagination.pages;
  }, result());
  const getCanNextPage = () => (table.options.pageCount = 3);
  const { pageIndex } = table.getState().pagination;

  return (
    <div>
      <Show when={!result.loading}>
        <Show when={result()}>
          {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
          <DataTable columns={columns} data={() => result()!.data} />
          <DataTablePagination
            previousPage={() => {
              table.previousPage();
              setPage((prev) => prev - 1);
            }}
            nextPage={() => {
              table.nextPage();
              setPage((prev) => prev + 1);
            }}
            getCanPreviousPage={table.getCanPreviousPage}
            getCanNextPage={() => {
              if (page() === 1 && result()?.pagination.pages > 1) {
                return true;
              }
              return table.getCanNextPage();
            }}
          />
        </Show>
      </Show>
    </div>
  );
}
