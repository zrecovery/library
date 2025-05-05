import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { type Unzipped, unzipSync } from "fflate";

const un = (file: ArrayBuffer) => {
  const u8 = new Uint8Array(file);
  return unzipSync(u8);
};
const CONTAINER_PATH = "META-INF/container.xml";

export class Epub {
  // file's arraybuffer
  readonly #package: Unzipped;
  #decoder: TextDecoder;
  #parser: DOMParser;
  container: Document;
  opf: Document;
  content?: Document;

  constructor(file: ArrayBuffer) {
    this.#package = un(file);
    this.#decoder = new TextDecoder();
    this.#parser = new DOMParser();

    this.container = this.#readXmlDocument(CONTAINER_PATH, "text/xml");
    const opfPath =
      this.container.getElementsByTagName("rootfile")[0].attributes["0"].value;
    this.opf = this.#readXmlDocument(opfPath, "text/xml");
    const contentPath = this.opf.getElementById("t1")?.getAttribute("href");
    if (contentPath) {
      this.content = this.#readXmlDocument2(`EPUB/${contentPath}`, "application/xhtml+xml");
    }
  }

  #readXmlDocument = (path: string, format: string) => {
    const buffer = this.#package[path];
    const text = this.#decoder.decode(buffer);
    return this.#parser.parseFromString(text, format);
  };
  #readXmlDocument2 = (path: string, format: string) => {
    const buffer = this.#package[path];
    const text = this.#decoder.decode(buffer);
    const result =  this.#parser.parseFromString(text, format);
    return result;
  };

  opfMeta = () => {
    const identifier = this.#getOpfMetaValue("dc:identifier");
    const title = this.#getOpfMetaValue("dc:title");
    const creator = this.#getOpfMetaValue("dc:creator");
    const language = this.#getOpfMetaValue("dc:language");
    const contributor = this.#getOpfMetaValue("dc:contributor");
    const coverage = this.#getOpfMetaValue("dc:coverage");
    const date = this.#getOpfMetaValue("dc:date");
    const description = this.#getOpfMetaValue("dc:description");
    const format = this.#getOpfMetaValue("dc:format");
    const publisher = this.#getOpfMetaValue("dc:publisher");
    const rights = this.#getOpfMetaValue("dc:rights");
    const relation = this.#getOpfMetaValue("dc:relation");
    const source = this.#getOpfMetaValue("dc:source");
    const subject = this.#getOpfMetaValue("dc:subject");
    const type = this.#getOpfMetaValue("dc:type");

    return {
      title,
      creator,
      contributor,
      coverage,
      date,
      description,
      format,
      publisher,
      identifier,
      language,
      rights,
      relation,
      source,
      subject,
      type,
    };
  };

  #getOpfMetaValue = (tagName: string) => {
    try {
      const element = this.opf.getElementsByTagName(tagName);
      if (element.length === 0) {
        return null;
      }
      return element[0].textContent;
    } catch (e) {
      console.error(e);
    }
  };

  getInfo = () => {
    const info = this.opfMeta();
    const { title, creator } = info;
    const s = new XMLSerializer();
    const r = /<section\sxmlns:epub=.*\n.*\s*<h2><\/h2>/gm;

    const bodyNode = this.content
      ?.getElementsByTagName("section")[0];
    if (!bodyNode) {
      throw new Error("未成功获取body节点");
    }

      const body = bodyNode.textContent.replaceAll("<br/>", "\n")
      .replaceAll("</section>", "")
      .replaceAll(r, "");
    return {
      title,
      author: { name: creator },
      body,
    };
  };
}
