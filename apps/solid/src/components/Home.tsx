export default function Home() {
  return (
    <div class="flex min-h-screen w-full flex-col bg-background">

      <div class="flex flex-1 overflow-hidden">
        <div class="hidden w-64 flex-col border-r bg-muted/40 p-4 sm:flex">
          <div class="flex items-center gap-2 pb-4">
            <h2 class="text-lg font-semibold">My Library</h2>
          </div>
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
        </div>
        <main class="flex-1 overflow-auto p-4 sm:p-6">
          <div class="grid gap-6">
            <div class="grid gap-2">
              <h2 class="text-2xl font-bold">Recently Added</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">The Great Gatsby</div>
                  <div class="text-xs text-muted-foreground">F. Scott Fitzgerald</div>
                </div>
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">To Kill a Mockingbird</div>
                  <div class="text-xs text-muted-foreground">Harper Lee</div>
                </div>
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">1984</div>
                  <div class="text-xs text-muted-foreground">George Orwell</div>
                </div>
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">Pride and Prejudice</div>
                  <div class="text-xs text-muted-foreground">Jane Austen</div>
                </div>
              </div>
            </div>
            <div class="grid gap-2">
              <h2 class="text-2xl font-bold">Your Series</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">The Witcher</div>
                  <div class="text-xs text-muted-foreground">Andrzej Sapkowski</div>
                </div>
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">A Song of Ice and Fire</div>
                  <div class="text-xs text-muted-foreground">George R.R. Martin</div>
                </div>
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">Harry Potter</div>
                  <div class="text-xs text-muted-foreground">J.K. Rowling</div>
                </div>
                <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
                  <div class="text-sm font-medium group-hover:underline">The Lord of the Rings</div>
                  <div class="text-xs text-muted-foreground">J.R.R. Tolkien</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
