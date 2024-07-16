import Card from "~/components/Card";

export default function Index() {
  return (
    <main class="flex-1 overflow-auto p-4 sm:p-6">
      <div class="grid gap-6">
        <div class="grid gap-2">
          <h2 class="text-2xl font-bold">Recently Added</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card title="The Last Wish" author="Andrzej Sapkowski" />
            <Card title="To Kill a Mockingbird" author="Harper Lee" />
            <Card title="1984" author="George Orwell" />
            <Card title="The Hobbit" author="J.R.R. Tolkien" />
          </div>
        </div>
        <div class="grid gap-2">
          <h2 class="text-2xl font-bold">Your Series</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card title="The Witcher" author="Andrzej Sapkowski" />
            <Card title="A Song of Ice and Fire" author="George R.R. Martin" />
            <Card title="The Lord of the Rings" author="J.R.R. Tolkien" />
            <Card title="Harry Potter" author="J.K. Rowling" />
          </div>
        </div>
      </div>
    </main>

  );
}
