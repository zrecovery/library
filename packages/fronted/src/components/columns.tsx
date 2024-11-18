import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import type { ColumnDef } from "@tanstack/solid-table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type Cols = {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
  chapter?: {
    id: number;
    title: string;
    order: number;
  };
};

export const columns: ColumnDef<Cols>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "标题",
  },
  {
    accessorKey: "author.name",
    header: "作者",
  },
  {
    accessorFn: (item) => item.chapter?.title,
    header: "系列",
  },
  {
    accessorFn: (item) => item.chapter?.order,
    header: "顺序",
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu placement="bottom-end">
        <DropdownMenuTrigger class="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"
            />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ml-2 size-4"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 5v14m4-4l-4 4m-4-4l4 4"
            />
          </svg>
        </Button>
      );
    },
  },
];
