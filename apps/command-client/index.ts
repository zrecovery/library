import { readdir } from "node:fs/promises";

import { type ArticleService, createArticleService } from "backend";
import {
  type Config,
  type Created,
  FileFormat,
  type Raw,
  format,
} from "./src/model.ts";
import { readArticle } from "./src/read.ts";

/*
Config example: {
  root: "",
  reg: /(\[\d*]\/)?(?<author_id>\d*)(\/(?<author>.*?)\/)((?<series>.*)\/)?\(#?(?<order>\d*)\)\[(?<pixiv_id>\d*)](?<title>.*)\.txt/,
  format: FileFormat.plain,
};
 */
const articlesService: ArticleService = createArticleService();
const save = (failures: string[]) => async (data: Created) => {
  const r = await articlesService.create(data);
  const handleResult = r.match({
    ok: (val) => val,
    err: (e) => {
      console.error(e);
      failures.push(data.filename);
      return e;
    },
  });
};

const filterFormat = (fileFormat: FileFormat) => (file: string) => {
  return file.endsWith(fileFormat);
};

export const localInput = async (config: Config) => {
  // 失败文件列表
  const failures: string[] = [];

  const files = await readdir(config.root, { recursive: true });
  const tasks: Raw[] = (
    await Promise.all(
      files
        .filter(filterFormat(config.format))
        .map(readArticle(config.format)(config.reg)(config.root)),
    )
  ).filter((task) => typeof task !== "undefined");

  await Promise.all(
    tasks
      .filter((r) => {
        return typeof r !== "undefined";
      })
      .map(format)
      .map(save(failures)),
  );

  console.log(`${failures.length}/${tasks.length}`);
  console.log(failures);
  console.log("finish");
};

localInput({
  root: "/home/dev/下载/epub",
  reg: /(\[\d{6}]\/)?(?<id>(\d*))_\((?<author_id>\d*)\)(_\[(?<series>.*)\((?<order>\d*)\)\]_)?\((?<author>(.*))\)(?<title>.*).epub/,
  format: FileFormat.epub,
});
