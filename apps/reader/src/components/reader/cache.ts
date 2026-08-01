import { openDB } from "idb";
export type PaginationCursor = {
	page: number;
	start: number;
};

export type Size = {
	width: number;
	height: number;
};

export interface ReaderStore {
	getPagination(id: number, size: Size): Promise<PaginationCursor[]>;
	setPagination(
		id: number,
		size: Size,
		pagination: PaginationCursor[],
	): Promise<void>;
}

const objectStoreName = "test";
const dbPromise = openDB("cache", 2, {
	upgrade(db) {
		db.createObjectStore(objectStoreName);
	},
});
const getIdbCache = async (id: number, size: Size) => {
	const db = await dbPromise;
	return db.get(objectStoreName, `${id}-${size.width}-${size.height}`);
};
const setIdbCache = async (
	id: number,
	size: Size,
	result: PaginationCursor[],
) => {
	const db = await dbPromise;
	db.put(objectStoreName, result, `${id}-${size.width}-${size.height}`);
};

export const readerStore: ReaderStore = {
	getPagination: getIdbCache,
	setPagination: setIdbCache,
};
