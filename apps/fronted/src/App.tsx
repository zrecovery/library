import type { Component } from "solid-js";
import Navbar from "./components/navbar";
import "./app.css";
import "./components/app-toast.css";
import { Toast, Root } from "@kobalte/core/toast";
import { Portal, Suspense } from "solid-js/web";

const App: Component = (props) => (
  <>
    <div
      class="
        grid
        h-screen
        grid-rows-[auto_1fr]
        "
      style="
      grid-gap:1rem;
    grid-template-areas: 'nav'
    'main';"
    >
      <nav class="[grid-area:nav] bg-gray-100">
        <Navbar />
      </nav>
      <main class="[grid-area:main] bg-white w-full h-full">
        <Suspense fallback={<p>Loading...</p>}>{props.children}</Suspense>
      </main>
    </div>
    <Portal>
      <Toast.Region
        style="--viewport-padding: 16px;
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      padding: var(--viewport-padding);
      gap: 8px;
      width: 400px;
      max-width: 100vw;
      margin: 0;
      list-style: none;
      z-index: 9999;
      outline: none;"
      >
        <Toast.List class="toast__list" />
      </Toast.Region>
    </Portal>
  </>
);

export default App;
