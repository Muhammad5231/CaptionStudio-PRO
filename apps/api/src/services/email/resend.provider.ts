import { IEmailProvider, EmailPayload } from './email.interface';

export class ResendEmailProvider implements IEmailProvider {
  readonly name = 'resend';
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(payload: EmailPayload): Promise<{ messageId?: string }> {
    if (!this.apiKey) {
      throw new Error('Resend provider is configured, but RESEND_API_KEY environment variable is missing.');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from || this.defaultFrom,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Resend email delivery failed (${res.status}): ${errorText}`);
    }

    const data = (await res.json()) as { id?: string };
    return { messageId: data.id };
  }
}

