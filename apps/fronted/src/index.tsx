import "uno.css";
import { render } from "solid-js/web";
import "solid-devtools";
import { Route, Router } from "@solidjs/router";
import App from "./App";
import ArticleCreatePage from "./routes/articles/create";
import ArticleList from "./routes/articles/list";
import ArticleDetailPage from "./routes/articles/detail";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/articles/create" component={ArticleCreatePage} />
      <Route path="/articles/list" component={ArticleList} />
      <Route path="/articles/:id" component={ArticleDetailPage} />
    </Router>
  ),
  root!,
);
