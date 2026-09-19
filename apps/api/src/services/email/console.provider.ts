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
      `📧 [Email:Console] Dispatched to: ${maskedTo} | Subject: "${payload.subject}" | Length: ${payload.html.length} chars`
    );

    // In local development, print the clickable verification/reset link so the developer can activate immediately
    if (process.env.NODE_ENV !== 'production') {
      const urlMatch = payload.text?.match(/https?:\/\/[^\s]+/i) || payload.html?.match(/href=["'](https?:\/\/[^"']+)["']/i);
      if (urlMatch) {
        const link = urlMatch[1] || urlMatch[0];
        console.log(`🔗 [Email:DevLink] Click to verify: ${link}`);
      }
    }

    return { messageId: `console-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` };
  }
}

