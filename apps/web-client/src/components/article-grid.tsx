import { For } from "solid-js";
import type { ArticleMeta } from "~/libs/schema";
import { ArticleCard } from "./article-card";

export const ArticleGrid = (props: { articles?: ArticleMeta[] }) => {
  const { articles } = props;
  return (
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-1 h-md justify-center align-center justify-items-center items-center overflow-auto"
      style="grid-area: main;height: calc(100vh - 16rem);"
    >
      <For each={articles}>{(meta) => <ArticleCard meta={meta} />}</For>
    </div>
  );
};
