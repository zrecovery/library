import ArticleRow from "@/components/article-row";
import ListPagination from "@/components/list-pagination";
import SearchAlertDialog from "@/components/search-alert";
import { getArticleList } from "@/libs/api";
import {
  createMemo,
  createResource,
  createSignal,
  For,
  type Component,
} from "solid-js";

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
    const keywords =
      queryParams.keywords.trim() === "" ? undefined : queryParams.keywords;
    const result = await getArticleList({
      pagination: {
        page: queryParams.page,
        size: queryParams.size,
      },
      keywords,
    });
    setPages(result?.data.pagination.pages);
    return result.data;
  });
  const articles = createMemo(() => response()?.data);

  return (
    <div class="grid gap-1 h-full grid-rows-[auto_1fr_auto] m-1 p-1">
      <div class="grid grid-cols-2 w-full  items-center p-2">
        <h1 class="justify-self-start">列表</h1>
        <div class="grid justify-items-end">
          <SearchAlertDialog action={setKeywords} />
        </div>
      </div>
      <div class="grid grid-cols-1 lg-grid-cols-2 grid-auto-flow-row-dense gap-4 justify-items-center items-center auto-rows-36 overflow-auto min-h-0">
        <For each={articles()} fallback={<div>Loading...</div>}>
          {(item, index) => (
            <div w-lg>
              <ArticleRow article={item} />
            </div>
          )}
        </For>
      </div>
      <div>
        <ListPagination
          pages={getPages}
          change={setPage}
          current={getPage}
        ></ListPagination>
      </div>
    </div>
  );
};

export default ArticleList;
