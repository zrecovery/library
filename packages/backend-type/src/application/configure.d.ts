interface PrismaClientConfig {
	log: Array<{
		emit: "event" | "stdout";
		level: "query" | "error" | "info" | "warn";
	}>;
}
interface Config {
	prismaClient?: PrismaClientConfig;
	readonly LIMIT: number;
}
export declare const config: Config;
export {};
