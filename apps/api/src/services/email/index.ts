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
  private getProviderConfig(): { provider: IEmailProvider; defaultFrom: string } {
    const providerName = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();
    const defaultFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'CaptionStudio <onboarding@resend.dev>';

    if (providerName === 'resend') {
      const apiKey = process.env.RESEND_API_KEY || '';
      return {
        provider: new ResendEmailProvider(apiKey, defaultFrom),
        defaultFrom,
      };
    } else if (providerName === 'smtp') {
      return {
        provider: new SMTPEmailProvider({
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
          defaultFrom,
        }),
        defaultFrom,
      };
    }

    return {
      provider: new ConsoleEmailProvider(),
      defaultFrom,
    };
  }

  async sendEmail(payload: EmailPayload): Promise<{ messageId?: string }> {
    const { provider, defaultFrom } = this.getProviderConfig();
    return provider.sendEmail({
      from: defaultFrom,
      ...payload,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const { subject, html, text } = buildPasswordResetEmail({
      resetUrl,
      expiresInMinutes: 30,
    });

    await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendEmailVerification(to: string, verificationUrl: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Verify your CaptionStudio PRO account',
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
      text: `Please verify your email by visiting: ${verificationUrl}`,
    });
  }

  async sendSecurityNotification(to: string, message: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Security Alert: CaptionStudio PRO account update',
      html: `<p>${message}</p>`,
      text: message,
    });
  }
}

export const emailService = new EmailService();

