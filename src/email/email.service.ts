import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs/promises';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly isProduction: boolean = process.env.NODE_ENV === 'production';

  constructor(private configService: ConfigService) {
    // For development, use a test account that doesn't require actual SMTP connection
    this.logger.log('Initializing EmailService in development mode with mock transport');
    
    // Create a test account using Ethereal.email
    const testAccount = {
      user: 'clyde.kuphal@ethereal.email',
      pass: 'xwDfKtqgVg3v9X9Wxr'
    };

    // Create a test account directly (this will be mocked in development)
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      // Skip verification in development
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP Server is ready to take our messages');
    } catch (error) {
      this.logger.error('SMTP Connection Error:', error);
    }
  }

  private getTemplatePath(templateName: string): string {
    // In production, templates are in the dist folder
    if (this.isProduction) {
      return path.join(process.cwd(), 'dist/email/templates', `${templateName}.ejs`);
    }
    // In development, use the src folder
    return path.join(__dirname, 'templates', `${templateName}.ejs`);
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = this.getTemplatePath(templateName);
      this.logger.debug(`Loading template from: ${templatePath}`);
      
      const template = await fs.readFile(templatePath, 'utf-8');
      return ejs.render(template, data);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}: ${error.message}`, error.stack);
      throw new Error(`Failed to render email template: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:5000')}/reset-password?token=${token}`;
    
    try {
      // In development, log the email instead of sending it
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`[DEV] Would send password reset email to: ${email}`);
        this.logger.log(`[DEV] Reset URL: ${resetUrl}`);
        
        // Return a mock response
        return {
          success: true,
          messageId: `dev-${Date.now()}`,
          previewUrl: `http://example.com/preview/${Date.now()}`
        };
      }
      
      // In production, send the actual email
      const html = await this.renderTemplate('reset-password', {
        name,
        resetUrl,
      });

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@example.com'),
        to: email,
        subject: 'Password Reset Request',
        html,
      };

      this.logger.log(`Sending password reset email to ${email}...`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
      
      // For Ethereal.email, return the preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: previewUrl || undefined
      };
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error.stack);
      return { 
        success: false,
        error: 'Failed to send email. Please try again later.'
      };
    }
  }
}
