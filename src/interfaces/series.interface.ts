import { Series } from "@src/model";
import { Creatable, Updatable } from "./common.interface";

export interface ISeriesCreateInput extends Creatable<Series> {}

export interface ISeriesUpdateInput extends Updatable<Series> {}
