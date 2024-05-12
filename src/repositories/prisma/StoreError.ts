export class StoreError extends Error {
	constructor(message: string) {
		super(`StoreError: ${message}`);
	}
}
