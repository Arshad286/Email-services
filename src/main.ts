import { ResilientEmailService } from './services/resilient-email-services';
import { Logger } from './utils/Logger';

async function main() {
  const emailService = new ResilientEmailService();

  try {
    const status = await emailService.sendEmail('recipient@example.com', 'Welcome!', 'Thank you for signing up.');
    
    if (status.success) {
      Logger.log(`Email sent successfully in ${status.attempts} attempt(s) using provider: ${status.lastProvider}`);
    } else {
      Logger.error(`Failed to send email after ${status.attempts} attempt(s). Error: ${status.errorMessage}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      Logger.error(`Critical error occurred: ${error.message}`);
    } else {
      Logger.error('Critical error occurred: Unknown error');
    }
  }
}

main();
