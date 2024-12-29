import type { Id } from "@shared/domain/types/common";

export interface Remover {
  remove(id: Id): Promise<void>;
}
