export class TagError extends Error {
  tag: unknown;
  constructor(message: string, tag: unknown) {
    super(message);
    this.tag = tag;
  }
}
