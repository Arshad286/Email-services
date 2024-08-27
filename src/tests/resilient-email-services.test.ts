import { ResilientEmailService } from '../services/resilient-email-services';
import { MockEmailProviderA } from '../providers/mock-email-provider-a';
import { MockEmailProviderB } from '../providers/mock-email-provider-b';

describe('ResilientEmailService', () => {
  let emailService: ResilientEmailService;
  const shortBackoffDelay = (attempts: number): Promise<void> => {
    return new Promise<void>((resolve) => setTimeout(resolve, 10));
  };

  beforeEach(() => {
    jest.spyOn(MockEmailProviderA.prototype, 'sendEmail').mockResolvedValue(true);
    jest.spyOn(MockEmailProviderB.prototype, 'sendEmail').mockResolvedValue(false);

    emailService = new ResilientEmailService(shortBackoffDelay);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should send email using the first provider', async () => {
    const status = await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    expect(status.success).toBe(true);
    expect(status.attempts).toBe(1);
    expect(status.lastProvider).toBe('MockEmailProviderA');
  });

  test('should fallback to the second provider if the first fails', async () => {
    jest.spyOn(MockEmailProviderA.prototype, 'sendEmail').mockRejectedValue(new Error('Provider A failure'));
    jest.spyOn(MockEmailProviderB.prototype, 'sendEmail').mockResolvedValue(true);

    const status = await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    expect(status.success).toBe(true);
    expect(status.attempts).toBe(2);
    expect(status.lastProvider).toBe('MockEmailProviderB');
  });

  test('should fail if both providers fail', async () => {
    jest.setTimeout(10000); 
    jest.spyOn(MockEmailProviderA.prototype, 'sendEmail').mockRejectedValue(new Error('Provider A failure'));
    jest.spyOn(MockEmailProviderB.prototype, 'sendEmail').mockRejectedValue(new Error('Provider B failure'));

    const status = await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    expect(status.success).toBe(false);
    expect(status.attempts).toBeGreaterThan(1);
    expect(status.errorMessage).toBe('Provider B failure');
  });

  test('should not send the same email twice (idempotency)', async () => {
    await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    const status = await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    
    expect(status.success).toBe(true);
    expect(status.attempts).toBe(0); 
  });

  test('should honor rate limiting', async () => {
    jest.spyOn(emailService['rateLimiter'], 'check').mockImplementation(() => {
      throw new Error('Rate limit exceeded');
    });

    await expect(emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body'))
      .rejects.toThrow('Rate limit exceeded');
  });
});
