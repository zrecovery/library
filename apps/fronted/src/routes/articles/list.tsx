import ArticleRow from "@/components/article-row";
import { getArticleList } from "@/libs/api";
import {
  createEffect,
  createMemo,
  createResource,
  For,
  type Component,
} from "solid-js";

const ArticleList: Component = () => {
  const [response] = createResource(async () => {
    const result = await getArticleList();
    return result.data;
  });
  const articles = createMemo(() => response()?.data);
  console.log(articles());
  const pagination = response()?.pagination;
  return (
    <>
      <For each={articles()} fallback={<div>Loading...</div>}>
        {(item, index) => (
          <div>
            <ArticleRow article={item} />
          </div>
        )}
      </For>
    </>
  );
};

export default ArticleList;
