type PageResult = { cursor: number, page: number }
type Size = { height: number, width: number }
const getCache = (title: string, size: Size): PageResult[] | undefined => {
    return [];
};

const setCache = (title: string, size: Size, page: PageResult): void => {

}

export const renderCache = (title: string, size: Size, page: PageResult): PageResult => {
    const cache = getCache(title, size);
    if (cache) {
        return cache;
    }

    return []

}
