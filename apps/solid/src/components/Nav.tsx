import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <nav class="flex flex-col gap-2">
      <a
        href="#"
        class="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span>Home</span>
      </a>
      <a
        href="#"
        class="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span>All Books</span>
      </a>
      <a
        href="#"
        class="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span>Favorites</span>
      </a>
      <a
        href="#"
        class="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span>Series</span>
      </a>
    </nav>

  );
}
