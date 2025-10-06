import { useParams } from "@solidjs/router";
import type { ArticleDetail } from "backend";
import { Show, createResource, mergeProps } from "solid-js";
import { ResultHandler } from "~/components/result-handler";
import { Button } from "~/components/ui/button";
import { articleRepository } from "~/libs/repository";
import {
  type WebRepositoryError,
  WebRepositoryErrorTag,
} from "~/libs/repository/error";

const useGetArticleDetail = (id: number) => {
  return createResource(() => id, articleRepository.detail);
};

const ArticleDisplay = (props: {
  value: ArticleDetail;
}) => {
  const article = () => props.value;
  return (
    <article class="p-1">
      <h1 id="title">{article().title}</h1>
      <div id="content" style="white-space: pre-wrap">
        {article().body}
      </div>
    </article>
  );
};

const ArticleDisplayErrorHandler = (props: {
  error: WebRepositoryError;
}) => {
  const { error } = mergeProps(props);

  switch (error.tag) {
    case WebRepositoryErrorTag.NotFound:
      return <h1>文章未找到</h1>;
    default:
      return <div>发生未知错误: {error.message}</div>;
  }
};

const DeleteButton = (props: { id: number }) => {
  const remove = async () => {
    const result = await articleRepository.remove(props.id);
    if (result.isErr()) {
      const error = result.unwrapErr();
      switch (error.tag) {
        case WebRepositoryErrorTag.NotFound:
          return alert("文章未找到");
        default:
          return alert(`删除失败: ${error.message}`);
      }
    } else {
      alert("删除成功");
      // 这里可以添加页面跳转逻辑
    }
  };
  return <Button onClick={remove}>删除</Button>;
};

export default function ArticleReader() {
  const { id } = useParams<{ id: string }>();
  const ID = Number(id);

  const [response] = useGetArticleDetail(ID);
  return (
    <Show when={response()}>
      {ResultHandler({
        result: response,
        children: ArticleDisplay,
        fallback: ArticleDisplayErrorHandler,
      })}
      <DeleteButton id={ID} />
    </Show>
  );
}
