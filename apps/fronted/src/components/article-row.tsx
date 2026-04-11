import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArticleMetaSchema,
  AuthorSchema,
  ChapterSchema,
  IdSchema,
} from "@library/domain";
import { Type, type Static } from "@sinclair/typebox";
import { A } from "@solidjs/router";
import { Show } from "solid-js";

const ArticleMetaInfo = Type.Composite([
  IdSchema,
  ArticleMetaSchema,
  Type.Object({
    chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
  }),
  Type.Object({ author: Type.Composite([IdSchema, AuthorSchema]) }),
]);
type ArticleMetaInfo = Static<typeof ArticleMetaInfo>;
const ArticleRow = (props: { article: ArticleMetaInfo }) => {
  const article = () => props.article;
  return (
    <Card class="w-screen-sm">
      <CardHeader>
        <A href={`/articles/${article().id}`}>
          <CardTitle>{article().title}</CardTitle>
        </A>
        <CardDescription>{article().author.name}</CardDescription>
      </CardHeader>
      <Show when={article().chapter}>
        <CardContent class="text-sm">{article().chapter?.title}</CardContent>
      </Show>
      <Show when={!article().chapter}>
        <CardContent class="text-sm"></CardContent>
      </Show>
    </Card>
  );
};

export default ArticleRow;
