import nodemailer, { Transporter } from 'nodemailer';
import { IEmailProvider, EmailPayload } from './email.interface';

export interface SMTPOptions {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  defaultFrom: string;
}

export class SMTPEmailProvider implements IEmailProvider {
  readonly name = 'smtp';
  private transporter: Transporter;
  private defaultFrom: string;

  constructor(options: SMTPOptions) {
    this.defaultFrom = options.defaultFrom;
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure ?? options.port === 465,
      auth:
        options.user && options.pass
          ? {
              user: options.user,
              pass: options.pass,
            }
          : undefined,
    });
  }

  async sendEmail(payload: EmailPayload): Promise<{ messageId?: string }> {
    const info = await this.transporter.sendMail({
      from: payload.from || this.defaultFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { messageId: info.messageId };
  }
}

