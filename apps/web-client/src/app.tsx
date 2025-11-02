import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import { Route, Router } from "@solidjs/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import { BaseLayout } from "~/components/base-layout";
import ArticleReader from "./routes/articles/[id]";
import ArticleList from "./routes/articles";
import AuthorDetailDisplay from "./routes/authors/[id]";
import ChapterDetailDisplay from "./routes/chapters/[id]";
import Home from "./routes";
import { NotFound } from "./routes/[...404]";

export default function App() {
  const footer = <footer class="bg-gray-800 text-white p-4">Footer</footer>;
  return (
    <Router
      root={(props) => (
        <>
          {BaseLayout({
            header: Nav(),
            main: <Suspense>{props.children}</Suspense>,
            footer: footer,
          })}
        </>
      )}
    >
      <Route path="/" component={Home} />
      <Route path="/articles/:id" component={ArticleReader} />
      <Route path="/articles" component={ArticleList} />
      <Route path="/authors/:id" component={AuthorDetailDisplay} />
      <Route path="/chapters/:id" component={ChapterDetailDisplay} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
}
