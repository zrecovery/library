import { Separator } from "@/components/ui/separator";
import { getArticleDetail } from "@/libs/api";
import { useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";

const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  return (
    <Show when={article()}>
      <div class="grid   md-grid-auto-cols-2 md-grid-cols-[min(10rem)_1fr]">
        <aside>
          <h2>{article()?.author.name}</h2>
        </aside>
        <main>
          <h1>{article()?.title}</h1>
          <Separator />
          <article class="whitespace-break-spaces word-wrap">
            {article()?.body}
          </article>
        </main>
      </div>
    </Show>
  );
};

export default ArticleDetailPage;
