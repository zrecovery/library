import type { Chapter, Series } from "@src/model";
import { BaseRepository } from "./base.repository.port";
export declare abstract class SeriesRepository extends BaseRepository<Series> {}
export declare abstract class ChapterRepository extends BaseRepository<Chapter> {}
