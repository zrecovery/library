export interface Rollbackable {
  rollback(): Promise<void>;
}
