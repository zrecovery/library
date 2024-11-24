import { A } from "@solidjs/router";
import { For, Show, createResource, createSignal } from "solid-js";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { articleRepository } from "~/libs/api";

export default function ArticleList() {
  const [page, setPage] = createSignal(1);
  const [size, setSize] = createSignal(3);
  const [keyword, setKeyword] = createSignal<string>("");
  const [result] = createResource(
    () => ({ page: page(), size: size(), keyword: keyword() }),
    articleRepository.list,
  );

  return (
    <Show when={!result.loading} fallback={<div>No fetch</div>}>
      <Show when={result()}>
        <div
          class="grid"
          style='height:100%;grid-template-areas: "main" "pagination"; grid-gap:1rem;grid-template-rows: 1fr 8rem;'
        >
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-md"
            style="grid-area: main "
          >
            <For each={result()?.data}>
              {(meta, index) => (
                <Card class="w-sm max-w-full max-h-xs">
                  <CardHeader>
                    <A href={`/articles/${meta.id}`}>
                      <CardTitle>{meta.title}</CardTitle>
                    </A>

                    <Show when={meta.chapter}>
                      <A href={`/books/${meta.id}`}>
                        <CardDescription>{meta.chapter?.title}</CardDescription>
                      </A>
                    </Show>
                  </CardHeader>
                  <CardFooter>
                    <p>{meta.author?.name}</p>
                  </CardFooter>
                </Card>
              )}
            </For>
          </div>
          <div
            class="justify-center max-w-full"
            style="grid-area: pagination;align-content: center;"
          >
            <Pagination
              page={page()}
              onPageChange={setPage}
              // @ts-ignore
              count={result().pagination.pages}
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
        </div>
      </Show>
    </Show>
  );
}
