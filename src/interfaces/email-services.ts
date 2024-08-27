import { Status } from "./status";

export interface EmailService {
    sendEmail(to: string, subject: string, body: string): Promise<Status>;
  }
  