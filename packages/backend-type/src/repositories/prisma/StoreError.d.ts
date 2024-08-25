export declare class StoreError extends Error {
	type: ErrorType;
	message: string;
	constructor(type: ErrorType, message: string);
}
export declare enum ErrorType {
	NotFound = "NotFound",
	ArgumentError = "ArgumentError",
	Other = "Other",
	InternalError = "InternalError",
}
