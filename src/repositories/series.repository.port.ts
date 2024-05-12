import { Chapter, Series } from "@src/model";
import { BaseRepository } from "./base.repository.port";

export abstract class SeriesRepository extends BaseRepository<Series> {}

export abstract class ChapterRepository extends BaseRepository<Chapter> {}
