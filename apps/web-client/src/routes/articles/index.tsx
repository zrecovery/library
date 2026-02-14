import type { ArticleListResponse } from "core";
import {
  type Accessor,
  createResource,
  createSignal,
  mergeProps,
  type Setter,
  Show,
} from "solid-js";
import { ArticleGrid } from "~/components/article-grid";
import { HolyGrailLayout } from "~/components/holy-grail-layout";
import { ListPagination } from "~/components/list-pagination";
import { PaginationLayout } from "~/components/pagination-layout";
import { ResultHandler } from "~/components/result-handler";
import { SearchButton } from "~/components/search-button";
import { articleRepository } from "~/libs/repository";
import {
  type WebRepositoryError,
  WebRepositoryErrorTag,
} from "~/libs/repository/error";

function usePagination() {
  const [page, setPage] = createSignal(1);
  const [size, setSize] = createSignal(10);

  return { page, setPage, size, setSize };
}

const useArticleData = (
  page: Accessor<number>,
  size: Accessor<number>,
  keyword: Accessor<string>,
) => {
  return createResource(
    () => ({ page: page(), size: size(), keyword: keyword() }),
    articleRepository.list,
  );
};

const ArticleListWithPagination =
  (props1: { page: Accessor<number>; setPage: Setter<number> }) =>
  (props: { value: ArticleListResponse }) => {
    const { page, setPage } = mergeProps(props1);
    const { value } = mergeProps(props);

    return (
      <>
        <div class="grid h-[100%] min-h-0 z-10">
          <ArticleGrid articles={value.data} />
        </div>
        <ListPagination
          page={page}
          setPage={setPage}
          count={value.pagination.pages}
        />
      </>
    );
  };

const ErrorHandler = (props: { error: WebRepositoryError }) => {
  const { error } = mergeProps(props);

  switch (error.tag) {
    case WebRepositoryErrorTag.NotFound:
      return <h1>未找到文章</h1>;
    default:
      return <div>发生未知错误: {error.message}</div>;
  }
};

const searchKeyword = (keyword: string, native: string) => {
  const normalize = (str: string, prefix: string) =>
    str
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => prefix + w);
  return [...normalize(keyword, "+"), ...normalize(native, "-")].join(" ");
};

export default function ArticleList() {
  const { page, setPage, size } = usePagination();
  const [keyword, setKeyword] = createSignal<string>("");
  const [query, setQuery] = createSignal<string>("");
  const [native, setNative] = createSignal<string>("");
  const [result] = useArticleData(page, size, query);

  return (
    <HolyGrailLayout
      search={{
        enable: true,
        body: (
          <SearchButton
            keyword={keyword}
            native={native}
            setKeyword={setKeyword}
            setNative={setNative}
            click={() => {
              setQuery(searchKeyword(keyword(), native()));
            }}
          />
        ),
      }}
    >
      <PaginationLayout>
        <Show when={result()}>
          {ResultHandler({
            result,
            children: ArticleListWithPagination({ page, setPage }),
            fallback: ErrorHandler,
          })}
        </Show>
      </PaginationLayout>
    </HolyGrailLayout>
  );
}
