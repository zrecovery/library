import type { Author } from "@/core/author/model/author.model";
import type AuthorRepository from "@/core/author/repository/AuthorRepository";
import type { PrismaClient } from "@prisma/client";


export class AuthorPrismaRepository implements AuthorRepository {
    #client: PrismaClient;

    constructor(client: PrismaClient) {
        this.#client = client;
    }

    public getList = async (limit?: number | undefined, offset?: number | undefined): Promise<Author[]> => {

        return await this.#client.author.findMany({
            skip: offset,
            take: limit
        });
    };

}
