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
      <h1>{article()?.title}</h1>
      <article>{article()?.body}</article>
      <aside>
        <h2>{article()?.author.name}</h2>
      </aside>
    </Show>
  );
};

export default ArticleDetailPage;
