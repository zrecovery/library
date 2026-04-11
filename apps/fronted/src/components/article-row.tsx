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
        <CardTitle>{article().title}</CardTitle>
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
