import { A } from "@solidjs/router";

import type { ChapterMeta } from "~/libs/schema";
import { Card, CardHeader, CardTitle } from "./ui/card";

export const ChapterCard = (props: { meta: ChapterMeta }) => {
  const { meta } = props;
  return (
    <Card class="w-md max-w-full h-32">
      <CardHeader>
        <A href={`/books/${meta.id}`}>
          <CardTitle class="truncate leading-normal">{meta.title}</CardTitle>
        </A>
      </CardHeader>
    </Card>
  );
};
