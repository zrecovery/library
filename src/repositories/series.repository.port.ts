import { Chapter, Series } from "@src/model";
import { BaseRepository } from "./base.repository.port";
import { Creatable } from "@src/interfaces/common.interface";

export abstract class SeriesRepository extends BaseRepository<Series> {}

export abstract class ChapterRepository extends BaseRepository<Chapter> {}
