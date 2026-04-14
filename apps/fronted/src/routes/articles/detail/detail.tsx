import { Separator } from "@/components/ui/separator";
import { getArticleDetail } from "@/libs/api";
import { useParams } from "@solidjs/router";
import { createEffect, createResource, Show } from "solid-js";

import { createSignal } from "solid-js";
import { useReader } from "./use-reader";

const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  // =========================
  // Reader state（你要的 signals）
  // =========================
  const [currentPage, setCurrentPage] = createSignal(0);
  const [total, setTotal] = createSignal(0);

  let containerRef!: HTMLDivElement;

  const [reader] = createResource(() =>
    useReader(
      () => article()?.body,
      () => containerRef,
      { setCurrentPage, setTotal },
      id,
    ),
  );

  // =========================
  // 数据加载后 build分页
  // =========================
  createEffect(() => {
    if (article()?.body && containerRef) {
      reader().build();
    }
  });

  return (
    <Show when={article()}>
      <Show when={reader()}>
        <div class="grid md-grid-auto-cols-2 h-full md-grid-cols-[min(10rem)_1fr]">
          <aside>
            <h2>{article()?.author.name}</h2>

            <div class="text-sm opacity-60">
              Page {currentPage() + 1} / {total()}
            </div>

            <button
              onClick={() => {
                const p = currentPage();
                if (p > 0) {
                  setCurrentPage(p - 1);
                  containerRef.textContent = reader()?.getPageContent(p - 1);
                }
              }}
            >
              Prev
            </button>

            <button
              onClick={() => {
                const p = currentPage();
                if (p + 1 < total()) {
                  setCurrentPage(p + 1);
                  containerRef.textContent = reader()?.getPageContent(p + 1);
                }
              }}
            >
              Next
            </button>
          </aside>

          <main class="grid grid-rows-[auto_auto_1fr] h-full">
            <h1>{article()?.title}</h1>
            <Separator />

            {/* Reader container */}
            <article
              ref={containerRef}
              class="whitespace-pre-wrap word-wrap overflow-hidden"
            >
              {reader()?.getPageContent(currentPage())}
            </article>
          </main>
        </div>
      </Show>
    </Show>
  );
};

export default ArticleDetailPage;
