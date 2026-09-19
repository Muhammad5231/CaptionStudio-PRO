export interface PasswordResetEmailData {
  resetUrl: string;
  expiresInMinutes: number;
}

export function buildPasswordResetEmail(data: PasswordResetEmailData): { html: string; text: string; subject: string } {
  const subject = 'Reset your CaptionStudio PRO password';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .header { padding: 32px 32px 24px; border-bottom: 1px solid #1f2937; text-align: center; }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
    .logo span { color: #635bff; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #9ca3af; }
    .content h1 { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
    .button-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #635bff; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; }
    .warning { background-color: rgba(99, 91, 255, 0.08); border-left: 3px solid #635bff; padding: 12px 16px; margin: 24px 0; font-size: 12px; color: #cbd5e1; border-radius: 0 6px 6px 0; }
    .footer { padding: 24px 32px; border-top: 1px solid #1f2937; font-size: 11px; color: #6b7280; text-align: center; }
    .break-url { word-break: break-all; font-size: 12px; color: #635bff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CaptionStudio <span>PRO</span></div>
    </div>
    <div class="content">
      <h1>Password Reset Request</h1>
      <p>We received a request to reset the password for your CaptionStudio PRO account. Click the secure button below to choose a new password:</p>
      
      <div class="button-container">
        <a href="${data.resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">Reset Password</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This reset link is single-use and will expire in ${data.expiresInMinutes} minutes. If you did not request this password reset, you can safely ignore this email — your account remains secure.
      </div>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="break-url">${data.resetUrl}</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CaptionStudio PRO. All rights reserved.<br>
      Enterprise AI Media and Video Caption Production Engine.
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
CaptionStudio PRO — Password Reset Request

We received a request to reset the password for your CaptionStudio PRO account.

To reset your password, navigate to the following link:
${data.resetUrl}

This link is valid for ${data.expiresInMinutes} minutes and can only be used once.

Security Notice:
If you did not request a password reset, please ignore this email. Your account credentials have not been modified.

CaptionStudio PRO Security Team
  `.trim();

  return { subject, html, text };
}

