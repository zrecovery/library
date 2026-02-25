export {
  create,
  detail,
  edit,
  findMany,
  remove,
} from "./modules/articles/services";

export { detail as authorDetail } from "./modules/authors/services";

export { detail as chapterDetail } from "./modules/chapters/services";

export { readConfig } from "./shared/domain/config";
