import { Author } from "@src/model";
import { Creatable, Updatable } from "./common.interface";

export interface IAuthorCreateInput extends Creatable<Author> {}

export interface IAuthorUpdateInput extends Updatable<Author> {}
