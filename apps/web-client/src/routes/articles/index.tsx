import { A } from "@solidjs/router";
import {
  type Accessor,
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  mergeProps,
} from "solid-js";
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
import "./index.css";

function usePagination() {
  const [page, setPage] = createSignal(1);
  const [size, setSize] = createSignal(10);

  return { page, setPage, size, setSize };
}

function useArticleData(
  page: Accessor<number>,
  size: Accessor<number>,
  keyword: Accessor<string>,
) {
  return createResource(
    () => ({ page: page(), size: size(), keyword: keyword() }),
    articleRepository.list,
  );
}

type ArticleMeta = {
  chapter?:
    | {
        title: string;
        order: number;
      }
    | undefined;
  id: number;
  title: string;
  author: {
    name: string;
  };
};

function ArticleCard(props: { meta: ArticleMeta }) {
  const { meta } = props;
  return (
    <Card class="w-md max-w-full h-32">
      <CardHeader>
        <A href={`/articles/${meta.id}`}>
          <CardTitle class="truncate leading-normal">{meta.title}</CardTitle>
        </A>
        <Show when={meta.chapter}>
          <A href={`/books/${meta.id}`}>
            <CardDescription class="truncate leading-normal">
              {meta.chapter?.title}
            </CardDescription>
          </A>
        </Show>
      </CardHeader>
      <CardFooter>
        <p>{meta.author?.name}</p>
      </CardFooter>
    </Card>
  );
}

function ArticleGrid(props: { articles: ArticleMeta[] }) {
  const { articles } = props;
  return (
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-2 h-md justify-center align-center justify-items-center items-center overflow-auto"
      style="grid-area: main;height: calc(100vh - 12rem);"
    >
      <For each={articles}>{(meta) => <ArticleCard meta={meta} />}</For>
    </div>
  );
}

export default function ArticleList() {
  const { page, setPage, size } = usePagination();
  const [keyword, setKeyword] = createSignal<string>("");
  const [result] = useArticleData(page, size, keyword);

  return (
    <Show when={!result.loading} fallback={<div>No fetch</div>}>
      <Show when={result()}>
        <div id="layout">
          <div />
          <div
            class="grid"
            style="height:100%;grid-template-areas: 'main' 'pagination'; grid-gap:1rem;grid-template-rows: 1fr 8rem;"
          >
            <ArticleGrid articles={result()?.data} />
            <div
              class="justify-center max-w-full"
              style="grid-area: pagination; align-content: center;"
            >
              <Pagination
                page={page()}
                onPageChange={setPage}
                count={result()?.pagination.pages || 1}
                itemComponent={(props) => (
                  <PaginationItem page={props.page}>
                    {props.page}
                  </PaginationItem>
                )}
                ellipsisComponent={() => <PaginationEllipsis />}
              >
                <PaginationPrevious />
                <PaginationItems />
                <PaginationNext />
              </Pagination>
            </div>
          </div>
          <div />
        </div>
      </Show>
    </Show>
  );
}
