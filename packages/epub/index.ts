/**
 * EPUB 解析器
 * 用于解析 EPUB 电子书文件并提取元数据与内容
 * @see https://www.w3.org/publishing/epub/
 */
import { DOMParser } from "@xmldom/xmldom";
import { type Unzipped, unzipSync } from "fflate";

// ============================================================================
// 类型定义
// ============================================================================

export interface EpubInfo {
  title: string | null;
  author: { name: string | null };
  body: string;
}

export interface EpubMetadata {
  title: string | null;
  creator: string | null;
  contributor: string | null;
  coverage: string | null;
  date: string | null;
  description: string | null;
  format: string | null;
  identifier: string | null;
  language: string | null;
  publisher: string | null;
  rights: string | null;
  relation: string | null;
  source: string | null;
  subject: string | null;
  type: string | null;
}

// ============================================================================
// 常量
// ============================================================================

const CONTAINER_PATH = "META-INF/container.xml";
const ROOT_FILE_ATTR = "0";
const CONTENT_ID = "t1";

const METADATA_FIELDS = [
  "dc:title",
  "dc:creator",
  "dc:contributor",
  "dc:coverage",
  "dc:date",
  "dc:description",
  "dc:format",
  "dc:identifier",
  "dc:language",
  "dc:publisher",
  "dc:rights",
  "dc:relation",
  "dc:source",
  "dc:subject",
  "dc:type",
] as const;

const EMPTY_SECTION_REGEX = /<section\sxmlns:epub=.*\n.*\s*<h2><\/h2>/gm;

// ============================================================================
// 纯函数 (每个 < 20 行)
// ============================================================================

const decompress = (file: ArrayBuffer): Unzipped =>
  unzipSync(new Uint8Array(file));

const decode =
  (decoder: TextDecoder) =>
  (buffer: Uint8Array): string =>
    decoder.decode(buffer);

const parseXml =
  (parser: DOMParser) =>
  (mime: string) =>
  (text: string): Document =>
    parser.parseFromString(text, mime);

const getAttr =
  (doc: Document) =>
  (id: string) =>
  (attr: string): string | null =>
    doc.getElementById(id)?.getAttribute(attr) ?? null;

const getText =
  (tag: string) =>
  (doc: Document): string | null => {
    const elems = doc.getElementsByTagName(tag);
    return elems.length > 0 ? elems[0].textContent : null;
  };

const getMeta =
  (doc: Document) =>
  (tag: string): string | null => {
    try {
      return getText(tag)(doc);
    } catch {
      return null;
    }
  };

const extractMetadata = (doc: Document): EpubMetadata => {
  const getVal = getMeta(doc);
  return METADATA_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.replace("dc:", "")]: getVal(field) }),
    {} as EpubMetadata,
  );
};

const cleanBody = (text: string): string =>
  text
    .replaceAll("<br/>", "\n")
    .replaceAll("</section>", "")
    .replaceAll(EMPTY_SECTION_REGEX, "");

const extractBody = (doc: Document | undefined): string => {
  const section = doc?.getElementsByTagName("section")[0];
  if (!section) throw new Error("Failed to get body section");
  return cleanBody(section.textContent ?? "");
};

// ============================================================================
// Epub 类
// ============================================================================

export class Epub {
  readonly #opf: Document;
  readonly #content?: Document;

  constructor(file: ArrayBuffer) {
    const data = decompress(file);
    const decoder = new TextDecoder();
    const parser = new DOMParser();

    const dec = decode(decoder);
    const parse = parseXml(parser);

    // 解析容器
    const container = parse("text/xml")(dec(data[CONTAINER_PATH]));

    // 解析 OPF
    const root = container.getElementsByTagName("rootfile")[0];
    const opfPath = root?.attributes[ROOT_FILE_ATTR]?.value;
    if (!opfPath) throw new Error("Missing OPF path");

    this.#opf = parse("text/xml")(dec(data[opfPath]));

    // 解析内容（可选）
    const contentPath = getAttr(this.#opf)(CONTENT_ID)("href");
    this.#content = contentPath
      ? parse("application/xhtml+xml")(dec(data[`EPUB/${contentPath}`]))
      : undefined;
  }

  getOpfMetadata = (): EpubMetadata => extractMetadata(this.#opf);

  getEpubInfo = (): EpubInfo => {
    const meta = this.getOpfMetadata();
    return {
      title: meta.title,
      author: { name: meta.creator },
      body: extractBody(this.#content),
    };
  };
}
