import { EmailProvider } from "../interfaces/email-provider";

export class MockEmailProviderA implements EmailProvider {
  private shouldFail: boolean;

  constructor(shouldFail: boolean = false) {
    this.shouldFail = shouldFail;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log('MockEmailProviderA: Sending email...');
    if (this.shouldFail) {
      throw new Error('MockEmailProviderA: Failed to send email.');
    }
    return true;
  }
}
