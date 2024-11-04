import type { RouteProps } from "@solidjs/router";
import { useParams } from "@solidjs/router";
import { Show, createResource } from "solid-js";
import { articleRepository } from "~/libs/api";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  console.log(id);
  const [response] = createResource(() => Number(id), articleRepository.detail);
  return (
    <Show when={!response.loading}>
      <Show when={response()}>
        <h1>{response()?.title}</h1>
      </Show>
    </Show>
  );
}
