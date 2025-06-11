import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // @Get('test-reset-email')
  // async testResetEmail(
  //   @Query('email') email: string,
  //   @Query('name') name: string = 'Test User'
  // ) {
  //   const token = 'test-token-12345';
  //   const result = await this.emailService.sendPasswordResetEmail(
  //     email,
  //     token,
  //     name
  //   );
    
  //   return {
  //     success: result,
  //     message: result 
  //       ? 'Test email sent successfully' 
  //       : 'Failed to send test email',
  //     token: token // Only for testing, don't do this in production
  //   };
  // }
}
