import type { JSX } from "solid-js";

export const BaseLayout = (props: {
  header: JSX.Element;
  main: JSX.Element;
  footer: JSX.Element;
}) => {
  return (
    <div class="min-h-screen grid grid-rows-[auto_1fr_auto] gap-y-4">
      <header class="sticky top-0 z-10 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700">
        {props.header}
      </header>

      <main class="w-full max-w-7xl mx-auto px-4 py-6 grid overflow-auto min-h-[calc(100vh-16rem)]">
        {props.main}
      </main>

      <footer class="bg-gray-100 dark:bg-dark-900 border-t border-gray-200 dark:border-gray-700">
        {props.footer}
      </footer>
    </div>
  );
};
