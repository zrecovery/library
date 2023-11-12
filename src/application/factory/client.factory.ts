import { PrismaClient } from "@prisma/client";
import { config } from "../configure";

export const clientFactory = ()=>{
    const client = new PrismaClient(config.prismaClient);

    if (process.env.NODE_ENV == "development") {
        client.$on("query", (e) => {
            console.log(`Query: ${e.query}`);
            console.log(`Params: ${e.params}`);
            console.log(`Duration: ${e.duration} ms`);
        });
    }
    return client;
}
