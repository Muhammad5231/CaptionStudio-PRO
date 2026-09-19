import { IEmailProvider, EmailPayload } from './email.interface';
import { ConsoleEmailProvider } from './console.provider';
import { ResendEmailProvider } from './resend.provider';
import { SMTPEmailProvider } from './smtp.provider';
import { buildPasswordResetEmail } from './email.templates';

export * from './email.interface';
export * from './console.provider';
export * from './resend.provider';
export * from './smtp.provider';
export * from './email.templates';

export interface IEmailService {
  sendEmail(payload: EmailPayload): Promise<{ messageId?: string }>;
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
  sendEmailVerification(to: string, verificationUrl: string): Promise<void>;
  sendSecurityNotification(to: string, message: string): Promise<void>;
}

export class EmailService implements IEmailService {
  private provider: IEmailProvider;
  private defaultFrom: string;

  constructor() {
    const providerName = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();
    this.defaultFrom = process.env.EMAIL_FROM || 'security@captionstudio.io';

    if (providerName === 'resend') {
      const apiKey = process.env.RESEND_API_KEY || '';
      const from = process.env.RESEND_FROM || this.defaultFrom;
      this.provider = new ResendEmailProvider(apiKey, from);
    } else if (providerName === 'smtp') {
      this.provider = new SMTPEmailProvider({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
        defaultFrom: this.defaultFrom,
      });
    } else {
      this.provider = new ConsoleEmailProvider();
    }
  }

  async sendEmail(payload: EmailPayload): Promise<{ messageId?: string }> {
    return this.provider.sendEmail({
      from: this.defaultFrom,
      ...payload,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const { subject, html, text } = buildPasswordResetEmail({
      resetUrl,
      expiresInMinutes: 30,
    });

    await this.provider.sendEmail({
      to,
      subject,
      html,
      text,
      from: this.defaultFrom,
    });
  }

  async sendEmailVerification(to: string, verificationUrl: string): Promise<void> {
    await this.provider.sendEmail({
      to,
      subject: 'Verify your CaptionStudio PRO account',
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
      text: `Please verify your email by visiting: ${verificationUrl}`,
      from: this.defaultFrom,
    });
  }

  async sendSecurityNotification(to: string, message: string): Promise<void> {
    await this.provider.sendEmail({
      to,
      subject: 'Security Alert: CaptionStudio PRO account update',
      html: `<p>${message}</p>`,
      text: message,
      from: this.defaultFrom,
    });
  }
}

export const emailService = new EmailService();

