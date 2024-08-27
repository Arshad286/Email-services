export class RateLimiter {
  private limit: number;
  private period: number;
  private sent: number;
  private resetTime: number;

  constructor(limit: number, period: number) {
    this.limit = limit;
    this.period = period;
    this.sent = 0;
    this.resetTime = Date.now();
  }

  public check(): void {
    const now = Date.now();
    if (now - this.resetTime > this.period) {
      this.sent = 0;
      this.resetTime = now;
    }

    if (this.sent >= this.limit) {
      throw new Error('Rate limit exceeded.');
    }

    this.sent++;
  }
}
