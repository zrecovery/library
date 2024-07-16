import { useParams } from "@solidjs/router";
import { createResource } from "solid-js/types/server/rendering.js";
import { getArticleDetail } from "~/libs/repositroy/web";

export default function ArticleDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [article] = createResource(async () => {
    const response = await getArticleDetail(id).get();
    return response.data;
  })

  return (
    <article>
      <h1>{article()?.detail.title}</h1>
      <div>{article()?.detail.body}</div>
    </article>
  )
}
