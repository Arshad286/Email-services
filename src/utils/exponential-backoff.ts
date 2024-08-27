export class ExponentialBackoff {
  static async delay(attempt: number): Promise<void> {
    const maxDelay = 3000; 
    const delayMs = Math.min(maxDelay, Math.pow(2, attempt) * 1000);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
}
