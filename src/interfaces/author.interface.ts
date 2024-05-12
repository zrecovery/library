import type { Author } from "@src/model";
import type { Creatable, Updatable } from "./common.interface";

export interface IAuthorCreateInput extends Creatable<Author> {}

export interface IAuthorUpdateInput extends Updatable<Author> {}
