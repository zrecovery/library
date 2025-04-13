import { For } from "solid-js";
import type { ChapterMeta } from "~/libs/schema";
import { ChapterCard } from "./chapter-card";

export const ChapterGrid = (props: { chapters?: ChapterMeta[] }) => {
  const { chapters } = props;
  return (
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-1 h-md justify-center align-center justify-items-center items-center overflow-auto"
      style="grid-area: main;height: calc(100vh - 12rem);"
    >
      <For each={chapters}>{(meta) => <ChapterCard meta={meta} />}</For>
    </div>
  );
};
