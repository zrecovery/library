import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import { BaseLayout } from "~/components/base-layout";

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
      <FileRoutes />
    </Router>
  );
}
