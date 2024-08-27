export class CircuitBreaker {
    private failureThreshold: number;
    private failureCount: number;
    private resetTimeout: number;
    private lastFailureTime: number | null;
  
    constructor(failureThreshold = 3, resetTimeout = 30000) {
      this.failureThreshold = failureThreshold;
      this.failureCount = 0;
      this.resetTimeout = resetTimeout;
      this.lastFailureTime = null;
    }
  
    public recordFailure(): void {
      this.failureCount++;
      this.lastFailureTime = Date.now();
    }
  
    public canAttempt(): boolean {
      if (this.failureCount < this.failureThreshold) {
        return true;
      }
  
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.failureCount = 0;
        this.lastFailureTime = null;
        return true;
      }
  
      return false;
    }
  }
  