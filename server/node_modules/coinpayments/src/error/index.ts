export default class CoinpaymentsError extends Error {
  public name: string;
  public message: string;
  public extra: Record<string, unknown>;

  constructor(message: string, extra: Record<string, unknown> = {}) {
    super(message);
    Error.captureStackTrace(this, CoinpaymentsError);
    this.message = message;
    this.extra = extra;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
