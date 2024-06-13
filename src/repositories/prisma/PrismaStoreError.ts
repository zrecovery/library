import { Prisma } from "@prisma/client";
import { ErrorType, StoreError } from "./StoreError";

export const prismaError =  (error:unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2001":
        return new StoreError(
          ErrorType.NotFound,
          `未找到：${error.stack}`,
        );
      default:
        return new StoreError(ErrorType.Other, `${error.stack}`);
    }
  } else {
    return new StoreError(ErrorType.Other, `${error}`);
  }
})
