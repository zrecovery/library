import { useParams } from "@solidjs/router";
import type { AuthorDetail } from "backend";
import { Show, createResource, mergeProps } from "solid-js";
import { ArticleGrid } from "~/components/article-grid";
import { ChapterGrid } from "~/components/chapter-grid";
import { ResultHandler } from "~/components/result-handler";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { authorRepository } from "~/libs/repository";
import {
  type WebRepositoryError,
  WebRepositoryErrorTag,
} from "~/libs/repository/error";

const useAuthorDetail = (id: number) => {
  return createResource(() => id, authorRepository.detail);
};

const AuthorDetailList = (props: { value: AuthorDetail }) => {
  const { value } = mergeProps(props);
  return (
    <>
      <Tabs defaultValue={"articles"}>
        <TabsList>
          <TabsTrigger value="articles">Article</TabsTrigger>
          <TabsTrigger value="chapters">Chapter</TabsTrigger>
          <TabsIndicator />
        </TabsList>
        <TabsContent value="articles">
          <ArticleGrid articles={value.articles} />
        </TabsContent>
        <TabsContent value="chapters">
          <ChapterGrid chapters={value.chapters} />
        </TabsContent>
      </Tabs>
    </>
  );
};

const AuthorDetailErrorHandler = (props: {
  error: WebRepositoryError;
}) => {
  const { error } = mergeProps(props);

  switch (error.tag) {
    case WebRepositoryErrorTag.NotFound:
      return <h1>Not Found</h1>;
    default:
      return <div>Unknown Error</div>;
  }
};

const AuthorDetailDisplay = () => {
  const { id } = useParams<{ id: string }>();
  const ID = Number(id);
  const [value] = useAuthorDetail(ID);

  return (
    <>
      <Show when={value()}>
        {ResultHandler({
          result: value,
          children: AuthorDetailList,
          fallback: AuthorDetailErrorHandler,
        })}
      </Show>
    </>
  );
};

export default AuthorDetailDisplay;
