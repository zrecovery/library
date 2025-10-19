import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        <div class="flex justify-center items-center">
          <span class="mr-5">Hello</span>{" "}
          <img
            class="w-12 h-12"
            src="https://unocss.dev/logo.svg"
            alt="UnoCSS logo"
          />
          !
        </div>
      </h1>
      <p class="my-4">
        <span>Home</span>
        {" - "}
        <A href="/admin" class="text-sky-600 hover:underline">
          Admin
        </A>
        {" - "}
        <A href="/settings" class="text-sky-600 hover:underline">
          Settings
        </A>
      </p>
    </main>
  );
}
