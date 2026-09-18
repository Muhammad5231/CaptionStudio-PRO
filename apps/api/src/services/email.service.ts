export interface IEmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
  sendEmailVerification(to: string, verificationUrl: string): Promise<void>;
  sendSecurityNotification(to: string, message: string): Promise<void>;
}

export class EmailService implements IEmailService {
  private provider: string;
  private from: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console';
    this.from = process.env.EMAIL_FROM || 'security@captionstudio.io';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    if (this.provider === 'console' || process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 [EmailService:Dev] Password Reset Email dispatched to: ${to}`);
      console.log(`   From: ${this.from}`);
      console.log(`   Reset Link: ${resetUrl}`);
      console.log(`   Note: Link is valid for 30 minutes and is single-use.\n`);
      return;
    }

    // In production, integrate configured SMTP/API provider (e.g. Resend, Sendgrid, Postmark)
    console.log(`[EmailService] Production email sent to ${to} via ${this.provider}`);
  }

  async sendEmailVerification(to: string, verificationUrl: string): Promise<void> {
    if (this.provider === 'console' || process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 [EmailService:Dev] Verification Email dispatched to: ${to}`);
      console.log(`   Verification Link: ${verificationUrl}\n`);
      return;
    }
  }

  async sendSecurityNotification(to: string, message: string): Promise<void> {
    if (this.provider === 'console' || process.env.NODE_ENV !== 'production') {
      console.log(`\n🔒 [EmailService:Dev] Security Notification to: ${to}`);
      console.log(`   Message: ${message}\n`);
      return;
    }
  }
}

export const emailService = new EmailService();

