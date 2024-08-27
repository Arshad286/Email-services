import { EmailProvider } from '../interfaces/email-provider';
import { EmailService } from '../interfaces/email-services';
import { Status } from '../interfaces/status';
import { Logger } from '../utils/Logger';
import { ExponentialBackoff } from '../utils/exponential-backoff';
import { RateLimiter } from './rate-limiter';
import { CircuitBreaker } from './circuit-breaker';
import { providers } from '../providers';

export class ResilientEmailService implements EmailService {
  private providers: EmailProvider[];
  private rateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;
  private sentEmails: Set<string>;
  private backoffDelay: (attempts: number) => Promise<void>;

  constructor(backoffDelay?: (attempts: number) => Promise<void>) {
    this.providers = providers;
    this.rateLimiter = new RateLimiter(5, 60000); // 5 emails per minute
    this.circuitBreaker = new CircuitBreaker();
    this.sentEmails = new Set();
    this.backoffDelay = backoffDelay || ExponentialBackoff.delay;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<Status> {
    const emailId = `${to}:${subject}`;
    
    if (this.sentEmails.has(emailId)) {
      Logger.log(`Email already sent to ${to} with subject ${subject}. Skipping.`);
      return { success: true, attempts: 0, lastProvider: null };
    }

    this.rateLimiter.check();

    let attempts = 0;
    let lastError: string | undefined = undefined;

    for (const provider of this.providers) {
      if (!this.circuitBreaker.canAttempt()) {
        return { success: false, attempts, lastProvider: provider.constructor.name, errorMessage: 'Circuit breaker open' };
      }

      attempts++;

      try {
        const success = await provider.sendEmail(to, subject, body);
        if (success) {
          this.sentEmails.add(emailId);
          Logger.log(`Email sent successfully using ${provider.constructor.name}.`);
          return { success: true, attempts, lastProvider: provider.constructor.name };
        }
      } catch (error) {
        if (error instanceof Error) {
          Logger.error(`${provider.constructor.name} failed: ${error.message}`);
          lastError = error.message;
        } else {
          Logger.error(`${provider.constructor.name} failed with an unknown error`);
          lastError = 'Unknown error occurred';
        }
        this.circuitBreaker.recordFailure();
  
        await this.backoffDelay(attempts);
      }
    }

    return { success: false, attempts, lastProvider: null, errorMessage: lastError };
  }
}
