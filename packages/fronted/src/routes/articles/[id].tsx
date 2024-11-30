import { useParams } from "@solidjs/router";
import { Show, createResource } from "solid-js";
import { Button } from "~/components/ui/button";
import { articleRepository } from "~/libs/api";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const ID = Number(id);
  const [response] = createResource(() => ID, articleRepository.detail);
  return (
    <Show when={!response.loading}>
      <Show when={response()}>
        <article class="p-1">
          <h1 id="title">{response()?.title}</h1>
          <div id="content" style="white-space: pre-wrap">
            {response()?.body}
          </div>
        </article>
        <Button
          onClick={() => {
            articleRepository.remove(ID).then((status) =>  {

            if (status === 201){
             console.log("delete"); 
            }else
          {
            alert("error");
          };
            });
          }}
        >
          删除
        </Button>
      </Show>
    </Show>
  );
}
