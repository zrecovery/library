import {
  type Accessor,
  type Setter,
  Show,
  createResource,
  createSignal,
  mergeProps,
} from "solid-js";

import { articleRepository } from "~/libs/repository";

import type { ArticleListResponse } from "backend";
import { ArticleGrid } from "~/components/article-grid";
import { HolyGrailLayout } from "~/components/holy-grail-layout";
import { ListPagination } from "~/components/list-pagination";
import { PaginationLayout } from "~/components/pagination-layout";
import { ResultHandler } from "~/components/result-handler";
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
  (props: {
    value: ArticleListResponse;
  }) => {
    const { page, setPage } = mergeProps(props1);
    const { value } = mergeProps(props);

    return (
      <>
        <ArticleGrid articles={value.data} />
        <ListPagination
          page={page}
          setPage={setPage}
          count={value.pagination.pages}
        />
      </>
    );
  };

const ErrorHandler = (props: {
  error: WebRepositoryError;
}) => {
  const { error } = mergeProps(props);

  switch (error.tag) {
    case WebRepositoryErrorTag.NotFound:
      return <h1>Not Found</h1>;
    default:
      return <div>Unknown Error</div>;
  }
};

export default function ArticleList() {
  const { page, setPage, size } = usePagination();
  const [keyword] = createSignal<string>("");
  const [result] = useArticleData(page, size, keyword);

  return (
    <HolyGrailLayout>
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
