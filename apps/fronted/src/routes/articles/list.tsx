import ArticleRow from "@/components/article-row";
import ListPagination from "@/components/list-pagination";
import SearchAlertDialog from "@/components/search-alert";
import { getArticleList } from "@/libs/api";
import type { Pagination } from "@library/domain";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  type Component,
} from "solid-js";
import { createStore } from "solid-js/store";

const ArticleList: Component = () => {
  const [getPage, setPage] = createSignal<number>(1);
  const [getPages, setPages] = createSignal<number>(1);
  const [getSize, setSize] = createSignal(10);
  const [getKeywords, setKeywords] = createSignal("");

  const getQueryParams = createMemo(() => {
    return {
      page: getPage(),
      size: getSize(),
      keywords: getKeywords(),
    };
  });

  const [response] = createResource(getQueryParams, async (queryParams) => {
    console.log(`List: ${getQueryParams().keywords}`);

    const keywords =
      queryParams.keywords.trim() === "" ? undefined : queryParams.keywords;
    const result = await getArticleList({
      pagination: {
        page: queryParams.page,
        size: queryParams.size,
      },
      keywords,
    });
    console.log(result?.data.pagination.pages);
    setPages(result?.data.pagination.pages);
    return result.data;
  });
  const articles = createMemo(() => response()?.data);

  return (
    <>
      <SearchAlertDialog action={setKeywords} />
      <For each={articles()} fallback={<div>Loading...</div>}>
        {(item, index) => (
          <div>
            <ArticleRow article={item} />
          </div>
        )}
      </For>

      <ListPagination
        pages={getPages}
        change={setPage}
        current={getPage}
      ></ListPagination>
    </>
  );
};

export default ArticleList;
