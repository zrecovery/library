import type { ColumnDef } from "@tanstack/solid-table";

export function AdminTable() {
  type Cols = {
    id: number;
    title: string;
    author: string;
    book?: string;
    order?: number;
  };

  const columns: ColumnDef<Cols>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: "标题",
    },
    {
      accessorKey: "author",
      header: "作者",
    },
    {
      accessorKey: "book",
      header: "系列",
    },
    {
      accessorKey: "order",
      header: "顺序",
    },
  ];
  return (
    <div>
      <p>1</p>
    </div>
  );
}
