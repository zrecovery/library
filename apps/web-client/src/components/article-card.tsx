import { A } from "@solidjs/router";
import { Show } from "solid-js";
import type { ArticleMeta } from "~/libs/schema";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const ArticleCard = (props: { meta: ArticleMeta }) => {
  const { meta } = props;
  return (
    <Card class="w-md max-w-full h-32">
      <CardHeader>
        <A href={`/articles/${meta.id}`}>
          <CardTitle class="truncate leading-normal">{meta.title}</CardTitle>
        </A>
        <Show when={meta.chapter}>
          <A href={`/chapters/${meta.chapter?.id}`}>
            <CardDescription class="truncate leading-normal">
              {meta.chapter?.title}
            </CardDescription>
          </A>
        </Show>
      </CardHeader>
      <CardFooter>
        <A href={`/authors/${meta.author.id}`}>
          <p>{meta.author?.name}</p>
        </A>
      </CardFooter>
    </Card>
  );
};
