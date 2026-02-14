import { useParams } from "@solidjs/router";
import type { ChapterDetail } from "core";
import { createResource, mergeProps, Show } from "solid-js";
import { ArticleGrid } from "~/components/article-grid";
import { ResultHandler } from "~/components/result-handler";
import { chapterRepository } from "~/libs/repository";

import {
  type WebRepositoryError,
  WebRepositoryErrorTag,
} from "~/libs/repository/error";

const useChapterDetail = (id: number) => {
  return createResource(() => id, chapterRepository.detail);
};

const ChapterDetailList = (props: { value: ChapterDetail }) => {
  const { value } = mergeProps(props);
  return (
    <>
      <ArticleGrid articles={value.articles} />
    </>
  );
};

const ChapterDetailErrorHandler = (props: { error: WebRepositoryError }) => {
  const { error } = mergeProps(props);

  switch (error.tag) {
    case WebRepositoryErrorTag.NotFound:
      return <h1>章节未找到</h1>;
    default:
      return <div>发生未知错误: {error.message}</div>;
  }
};

const ChapterDetailDisplay = () => {
  const { id } = useParams<{ id: string }>();
  const ID = Number(id);
  const [value] = useChapterDetail(ID);

  return (
    <>
      <Show when={value()}>
        {ResultHandler({
          result: value,
          children: ChapterDetailList,
          fallback: ChapterDetailErrorHandler,
        })}
      </Show>
    </>
  );
};

export default ChapterDetailDisplay;
