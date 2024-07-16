export default function Header() {
  return (<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
    <a href="#" class="flex items-center gap-2">
      <span class="text-lg font-semibold">Ebook Reader</span>
    </a>
    <div class="relative flex-1">
      <div class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search books..."
        class="w-full rounded-lg bg-muted pl-8 pr-4 focus:bg-background"
      />
    </div>
  </header>)
}
