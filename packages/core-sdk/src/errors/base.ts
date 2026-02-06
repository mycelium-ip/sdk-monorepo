// Base SDK error class
export class SDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
