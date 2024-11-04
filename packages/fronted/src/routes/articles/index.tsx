import { A } from "@solidjs/router";
import {
  For,
  Match,
  Show,
  Switch,
  createResource,
  createSignal,
} from "solid-js";
import { articleRepository } from "~/libs/api";

export default function ArticleList() {
  const [page, setPage] = createSignal(1);
  const [size, setSize] = createSignal(10);
  const [keyword, setKeyword] = createSignal<string>("");
  const [result] = createResource(
    () => ({ page: page(), size: size(), keyword: keyword() }),
    articleRepository.list,
  );

  return (
    <Show when={!result.loading} fallback={<div>No fetch</div>}>
      <Show when={result()}>
        <For each={result().data}>
          {(meta, index) => (
            <div>
              <A href={`/articles/${meta.id}`}>
                <p>{meta.title}</p>
              </A>
            </div>
          )}
        </For>
      </Show>
    </Show>
  );
}
