import { Separator } from "@/components/ui/separator";
import { getArticleDetail } from "@/libs/api";
import { useParams } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { useReader } from "./use-reader";
import { setCurrentPageCache } from "./db";
import ReaderPagination from "@/components/reader-pagination";

const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  const [currentPage, setCurrentPage] = createSignal(1);
  const [total, setTotal] = createSignal(1);

  let containerRef!: HTMLDivElement;

  const [reader] = createResource(() =>
    useReader(
      () => article()?.body,
      () => containerRef,
      { setCurrentPage, setTotal },
      id,
    ),
  );

  // ✅ 初次 build（只触发一次）
  createEffect(() => {
    if (article()?.body && containerRef && reader()) {
      reader()!.build();
    }
  });

  // ✅ 渲染内容
  createEffect(() => {
    if (reader() && total() > 0) {
      containerRef.textContent = reader()!.getPageContent(currentPage());
    }
  });

  // ✅ ⭐记录阅读进度（关键）
  let initialized = false;

  createEffect(() => {
    const r = reader();
    if (!r) return;

    const key = r.getKey();
    if (!key) return;

    const page = currentPage();

    // ⭐跳过第一次（关键）
    if (!initialized) {
      initialized = true;
      return;
    }
    if (page === 0 && total() > 0) return;
    setCurrentPageCache(key, page);
  });

  // ✅ Resize 触发 rebuild（防抖）
  let ro: ResizeObserver;
  let timer: number | undefined;
  let lastWidth = 0;

  onMount(() => {
    ro = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width === lastWidth) return;

      lastWidth = width;
      clearTimeout(timer);
      timer = setTimeout(() => {
        reader()?.rebuild();
      }, 200);
    });

    ro.observe(containerRef);
  });

  onCleanup(() => {
    ro?.disconnect();
  });

  return (
    <Show when={article()}>
      <Show when={reader()}>
        <div class="grid md:grid-cols-[min(10rem)_1fr] h-full">
          <aside>
            <h2>{article()?.author.name}</h2>
          </aside>

          <main class="grid grid-rows-[auto_auto_1fr_auto] h-full">
            <h1>{article()?.title}</h1>
            <Separator />

            <article
              ref={containerRef}
              class="whitespace-pre-wrap break-words overflow-hidden"
            />
            <div class="p-[2rem]">
              <ReaderPagination
                pages={total}
                change={setCurrentPage}
                current={currentPage}
              ></ReaderPagination>
            </div>
          </main>
        </div>
      </Show>
    </Show>
  );
};

export default ArticleDetailPage;
