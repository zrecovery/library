import { For } from "solid-js";
import type { ArticleMeta } from "~/libs/schema";
import { ArticleCard } from "./article-card";

export const ArticleGrid = (props: { articles?: ArticleMeta[] }) => {
  const { articles } = props;
  return (
    <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 gap-1 justify-center align-center justify-items-center items-center overflow-hidden h-[100%] min-h-0">
      <For each={articles}>{(meta) => <ArticleCard meta={meta} />}</For>
    </div>
  );
};
