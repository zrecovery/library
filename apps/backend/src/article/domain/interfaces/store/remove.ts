import type { Id } from "src/model";

export interface Remove {
  remove(id: Id): Promise<void>;
}

