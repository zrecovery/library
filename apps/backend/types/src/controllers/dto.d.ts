export declare const ArticleCreatedDto: import("@sinclair/typebox").TObject<{
    title: import("@sinclair/typebox").TString;
    body: import("@sinclair/typebox").TString;
    author: import("@sinclair/typebox").TString;
    book: import("@sinclair/typebox").TString;
}>;
export declare const ArticleEditDto: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    title: import("@sinclair/typebox").TString;
    body: import("@sinclair/typebox").TString;
    author: import("@sinclair/typebox").TString;
    book: import("@sinclair/typebox").TString;
}>;
export declare const ArticleDto: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    title: import("@sinclair/typebox").TString;
    body: import("@sinclair/typebox").TString;
    author: import("@sinclair/typebox").TString;
    author_id: import("@sinclair/typebox").TNumber;
    book: import("@sinclair/typebox").TString;
    book_id: import("@sinclair/typebox").TNumber;
    love: import("@sinclair/typebox").TBoolean;
}>;
export declare const BookDto: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    title: import("@sinclair/typebox").TString;
}>;
export declare const AuthorDto: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    name: import("@sinclair/typebox").TString;
}>;
