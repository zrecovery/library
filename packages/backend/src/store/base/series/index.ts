import { create } from "./create";
import { findOrCreate } from "./find-or-create";
import { findMany } from "./findMany";

export const seriesBaseStore = {
  findMany,
  create,
  findOrCreate,
};
