import { EmailProvider } from "../interfaces/email-provider";

export class MockEmailProviderB implements EmailProvider {
  private shouldFail: boolean;

  constructor(shouldFail: boolean = false) {
    this.shouldFail = shouldFail;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log('MockEmailProviderB: Sending email...');
    if (this.shouldFail) {
      throw new Error('MockEmailProviderB: Failed to send email.');
    }
    return true;
  }
}
