import type { Series } from "@src/model";
import type { Creatable, Updatable } from "./common.interface";

export interface ISeriesCreateInput extends Creatable<Series> {}

export interface ISeriesUpdateInput extends Updatable<Series> {}
