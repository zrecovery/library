import { JSX } from "solid-js";
import { Result } from "result";

type ChapterFormat = {
	level: number;
	format: string;
}[];

type ChapterCursor = {
	cursor: number;
	chapter: string;
	level: number;
};

type Book = {
	title: string;
	author: string;
	content: string;
	chapter: ChapterCursor[];
};

type Pagination = {
	page: number;
	cursor: number;
}[];

type importFile = (file: File) => {
	id: number;
	title: string;
	content: string;
};

type parseChapter = (chapterFormat: ChapterFormat, content: string) => Book;
type findNextPageCursor = (
	container: HTMLElement,
	book: Book,
	start: number,
) => number;
type findPrevPageCursor = (
	container: HTMLElement,
	book: Book,
	start: number,
) => number;

type render = (
	container: HTMLElement,
	book: Book,
	cursor: number,
) => Pagination;
interface IdxError extends Error {}
type savePagination = (
	id: number,
	pagination: Pagination,
) => Promise<Result<void, IdxError>>;
type display = (
	container: HTMLElement,
	book: Book,
	cursor: number,
) => JSX.Element;

type copyContainer = (container: HTMLElement) => HTMLElement;
type Size = { width: number; height: number };
type getCache = (id: number, size: Size) => Result<Pagination, IdxError>;

type findKeywordCursor = (content: string, keyword: string) => number[];
type getPageIncludeCursor = (cursors: number[]) => number[];

interface Store {
	getPaginationCache: getCache;
	savePaginationCache: savePagination;
	saveFile: (file: File) => Promise<Result<number, IdxError>>;
}
