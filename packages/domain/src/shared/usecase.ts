export interface UseCase<T, R> {
  execute(port: T): Promise<R>;
}
