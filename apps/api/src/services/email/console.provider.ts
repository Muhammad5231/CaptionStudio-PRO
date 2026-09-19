import { IEmailProvider, EmailPayload } from './email.interface';

export class ConsoleEmailProvider implements IEmailProvider {
  readonly name = 'console';

  async sendEmail(payload: EmailPayload): Promise<{ messageId?: string }> {
    // Mask email address to avoid leaking PII in logs
    const maskedTo = payload.to.replace(
      /^(.)(.*)(@.*)$/,
      (_, first, middle, domain) => `${first}${'*'.repeat(Math.min(middle.length, 4))}${domain}`
    );

    console.log(
      `📧 [Email:Console] Dispatched to: ${maskedTo} | Subject: "${payload.subject}" | Length: ${payload.html.length} chars (No tokens or credentials logged)`
    );

    return { messageId: `console-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` };
  }
}

