export type Consumer<T> = (message: T) => void;

export interface Queue<M, R> {
  enqueue(message: M): Promise<R>;

  flush(shutdown: boolean): void;
}
