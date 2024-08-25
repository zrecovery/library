import type { Article } from "@src/model";
import type { Creatable, Updatable } from "./common.interface";
export interface IArticleCreateInput extends Creatable<Article> {}
export interface IArticleUpdateInput extends Updatable<Article> {}
