import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..'));

  // Global Prefix
  app.setGlobalPrefix('api');
  // CORS Configuration
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    exposedHeaders: 'Authorization',
  });

  // Handle preflight requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    // forbidNonWhitelisted: true, 
    transform: true,
  }));

  // Security Middleware
  app.use(helmet());

  // Global Exception Filter
  app.useGlobalFilters(app.get(AllExceptionsFilter));

  // API Documentation with Swagger
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('E-Commerce REST API')
    .setDescription('## Comprehensive API documentation for the E-Commerce platform\n\nThis API provides endpoints for managing products, categories, users, orders, payments, and more.\n\n### Authentication\nMost endpoints require authentication. Use the `/auth/login` endpoint to get a JWT token and include it in the `Authorization` header as `Bearer <token>.')
    .setVersion('1.0')
    // .addServer(process.env.API_URL || 'http://localhost:5000', 'Development server')
    // .addBearerAuth()
    .addTag('Authentication', 'User authentication and registration')
    .addTag('Users', 'User management and profiles')
    .addTag('Products', 'Product catalog management')
    .addTag('Categories', 'Product categories management')
    .addTag('Orders', 'Order processing and management')
    .addTag('Payments', 'Payment processing')
    .addTag('Cart', 'Shopping cart operations')
    .addTag('Reviews', 'Product reviews and ratings')
    .setContact(
      'E-Commerce Support',
      'https://example.com/support',
      'support@example.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();


  const document = SwaggerModule.createDocument(app, config);
  
  // Get the base URL for the API
  const apiBaseUrl =`http://localhost:${process.env.PORT || 5000}`;
  
  // Customize Swagger UI
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'E-Commerce API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
      .swagger-ui .auth-btn-wrapper { display: flex; align-items: center; }
      .swagger-ui .authorize { margin-right: 10px; }
      .swagger-ui .auth-container { margin: 20px 0; }
    `,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true, // Persist authorization across page reloads
      oauth2RedirectUrl: `${apiBaseUrl}/api/oauth2-redirect.html`,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      defaultModelExpandDepth: 2,
      defaultModelsExpandDepth: 2,
      defaultModelRendering: 'example',
      displayRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      withCredentials: true,
      // Security definitions for Swagger UI
      securityDefinitions: {
        'JWT-auth': {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter JWT token',
        },
      },
      // Enable CORS for Swagger UI
      requestInterceptor: (req) => {
        // Get the token from the authorization header
        const token = localStorage.getItem('authorization');
        if (token) {
          req.headers['Authorization'] = token;
        }
        // Ensure credentials are included for CORS
        req.credentials = 'include';
        return req;
      },
      // Add response interceptor to handle CORS
      responseInterceptor: (res) => {
        // Ensure CORS headers are set
        res.headers = res.headers || {};
        res.headers['Access-Control-Allow-Origin'] = '*';
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        return res;
      },
      // Add security requirements
      security: [
        { 'JWT-auth': [] }
      ]
    },
  });
  const host = '0.0.0.0'; // Listen on all network interfaces

  await app.listen(process.env.PORT ?? 3000, host);
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap();
