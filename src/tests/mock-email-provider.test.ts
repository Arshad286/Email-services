import { MockEmailProviderA } from '../providers/mock-email-provider-a';
import { MockEmailProviderB } from '../providers/mock-email-provider-b';

describe('MockEmailProviderA', () => {
  test('should send email successfully', async () => {
    const provider = new MockEmailProviderA();
    const result = await provider.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    expect(result).toBe(true);
  });
});

describe('MockEmailProviderB', () => {
    test('should fail to send email', async () => {
        const provider = new MockEmailProviderA(true); 
        await expect(provider.sendEmail('test@example.com', 'Test Subject', 'Test Body')).rejects.toThrow('MockEmailProviderA: Failed to send email.');
      });
});
