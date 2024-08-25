import { Prisma } from "@prisma/client";
import { ErrorType, StoreError } from "er/store.error";

export const prismaError = (error: unknown) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2001":
				return new StoreError(ErrorType.NotFound, `未找到：${error.stack}`);
			case "P2025":
				return new StoreError(ErrorType.Duplicate, `重复：${error.stack}`);
			default:
				return new StoreError(ErrorType.Other, `${error.stack}`);
		}
	}
	return new StoreError(ErrorType.Other, `${error}`);
};
