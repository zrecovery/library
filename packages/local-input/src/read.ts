import { Epub } from "epub";
import { FileFormat, type Raw } from "./model.ts";

const getPlainTextContent = async (path: string) => {
  const h = Bun.file(path);
  return h.text();
};

const getEpubContent = async (path: string): Promise<string | undefined> => {
  try {
    const file = Bun.file(path);
    const buffer = await file.arrayBuffer();
    const epub = new Epub(buffer);
    const info = epub.getInfo();
    return info.body;
  } catch (e) {
    console.error(path);
    console.error(e);
  }
};

const getContent = (fileFormat: FileFormat) => (path: string) => {
  switch (fileFormat) {
    case FileFormat.epub:
      return getEpubContent(path);
    case FileFormat.plain:
      return getPlainTextContent(path);
  }
};

export const readArticle =
  (fileFormat: FileFormat) =>
  (reg: RegExp) =>
  (root: string) =>
  async (filename: string): Promise<Raw | undefined> => {
    const re = reg.exec(filename);

    if (!re) {
      console.error(filename);
      //throw new Error(`正则匹配失败${filename}`);
    } else {
      const groups = re.groups;
      if (!groups) {
        throw new Error(`正则匹配失败${filename}`);
      }

      const body = await getContent(fileFormat)(`${root}/${filename}`);
      if (!body) {
        console.error(filename);
        throw new Error("未能成功获取body");
      }
      return {
        filename: filename,
        title: groups.title,
        body: body,
        author: groups.author,
        author_id: groups.author_id,
        order: groups.order,
        series: groups.series,
      };
    }
  };
