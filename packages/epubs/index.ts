import { readdir } from "node:fs/promises";

const root = "";

const files = await readdir(root, { recursive: true });
const getContent = (f: string) => Bun.file(f);
const simple = "(12309534)(author哈)[books(#01)]title.txt";
const reg =
    /\((?<id>\d*)\)\((?<author>.*)\)\[(?<series>.*)\(#(?<order>\d*)\)\](?<title>.*).txt/gm;

const r = async (path: string) => {
    const { id, author, series, order, title } = reg.exec(path)?.groups;

    const content = await getContent(path);
    return {
        id,
        author,
        series,
        order,
        title,
        content,
    };
};
