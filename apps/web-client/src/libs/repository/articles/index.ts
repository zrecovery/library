import type { ArticleRepository } from "../api";
import { create } from "./create";
import { detail } from "./detail";
import { list } from "./list";
import { remove } from "./remove";

export class ArticleEdenRepository implements ArticleRepository {
  detail = detail;
  list = list;
  create = create;
  remove = remove;
}
