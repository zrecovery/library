import type { AuthorRepository } from "../api";

import { detail } from "./detail";

export class AuthorEdenRepository implements AuthorRepository {
  detail = detail;
}
