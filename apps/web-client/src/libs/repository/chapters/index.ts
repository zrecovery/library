import type { ChapterRepository } from "../api";

import { detail } from "./detail";

export class ChapterEdenRepository implements ChapterRepository {
  detail = detail;
}
