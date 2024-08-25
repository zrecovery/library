export declare const ArticleCreatedRequestDto: import("@sinclair/typebox").TObject<{
	title: import("@sinclair/typebox").TString;
	body: import("@sinclair/typebox").TString;
	author: import("@sinclair/typebox").TString;
	book: import("@sinclair/typebox").TString;
}>;
export declare const ArticleEditRequestDto: import("@sinclair/typebox").TObject<{
	id: import("@sinclair/typebox").TNumber;
	title: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TString
	>;
	body: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TString
	>;
	author: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TString
	>;
	book: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TString
	>;
	order: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TString
	>;
}>;
export declare const ArticleDetailSchema: import("@sinclair/typebox").TObject<{
	id: import("@sinclair/typebox").TNumber;
	title: import("@sinclair/typebox").TString;
	body: import("@sinclair/typebox").TString;
	created_at: import("@sinclair/typebox").TDate;
	updated_at: import("@sinclair/typebox").TDate;
	authors: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TArray<
			import("@sinclair/typebox").TObject<{
				id: import("@sinclair/typebox").TNumber;
				name: import("@sinclair/typebox").TString;
			}>
		>
	>;
	series: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TObject<{
			id: import("@sinclair/typebox").TNumber;
			title: import("@sinclair/typebox").TString;
		}>
	>;
	order: import("@sinclair/typebox").TOptional<
		import("@sinclair/typebox").TNumber
	>;
}>;
export declare const ArticlePaginatedHttpDto: import("@sinclair/typebox").TObject<{
	pagination: import("@sinclair/typebox").TObject<{
		items: import("@sinclair/typebox").TNumber;
		pages: import("@sinclair/typebox").TNumber;
		size: import("@sinclair/typebox").TNumber;
		current: import("@sinclair/typebox").TNumber;
	}>;
	detail: import("@sinclair/typebox").TArray<
		import("@sinclair/typebox").TObject<{
			id: import("@sinclair/typebox").TNumber;
			title: import("@sinclair/typebox").TString;
			body: import("@sinclair/typebox").TString;
			authors: import("@sinclair/typebox").TOptional<
				import("@sinclair/typebox").TArray<
					import("@sinclair/typebox").TObject<{
						id: import("@sinclair/typebox").TNumber;
						name: import("@sinclair/typebox").TString;
					}>
				>
			>;
			series: import("@sinclair/typebox").TOptional<
				import("@sinclair/typebox").TObject<{
					id: import("@sinclair/typebox").TNumber;
					title: import("@sinclair/typebox").TString;
				}>
			>;
			order: import("@sinclair/typebox").TOptional<
				import("@sinclair/typebox").TNumber
			>;
		}>
	>;
}>;
export declare const ArticleHttpDto: import("@sinclair/typebox").TObject<{
	detail: import("@sinclair/typebox").TObject<{
		id: import("@sinclair/typebox").TNumber;
		title: import("@sinclair/typebox").TString;
		body: import("@sinclair/typebox").TString;
		created_at: import("@sinclair/typebox").TDate;
		updated_at: import("@sinclair/typebox").TDate;
		authors: import("@sinclair/typebox").TOptional<
			import("@sinclair/typebox").TArray<
				import("@sinclair/typebox").TObject<{
					id: import("@sinclair/typebox").TNumber;
					name: import("@sinclair/typebox").TString;
				}>
			>
		>;
		series: import("@sinclair/typebox").TOptional<
			import("@sinclair/typebox").TObject<{
				id: import("@sinclair/typebox").TNumber;
				title: import("@sinclair/typebox").TString;
			}>
		>;
		order: import("@sinclair/typebox").TOptional<
			import("@sinclair/typebox").TNumber
		>;
	}>;
}>;
