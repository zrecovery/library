import type { Person, Author, Chapter, Series } from "model/domain";
import type { Creatable } from "model/protocol";
import type { BasePrismaRepos } from "./base";

export type ModelToType<M extends keyof BasePrismaRepos> = M extends "chapter"
	? Chapter
	: M extends "person"
		? Person
		: M extends "Author"
			? Author
			: M extends "series"
				? Series
				: never;

export const findOrCreate =
	(base: BasePrismaRepos) =>
	async <M extends Exclude<keyof BasePrismaRepos, "article">>(
		model: M,
		data: Creatable<ModelToType<M>>,
	): Promise<number> => {
		const result = await base[model].find(data);
		if (model === "person") {
			return (
				result?.id ?? (await base.person.create(data as Creatable<Person>)).id
			);
		}
		if (model === "series") {
			return (
				result?.id ?? (await base.series.create(data as Creatable<Series>)).id
			);
		}
		throw new Error("Unsupported model type");
	};
