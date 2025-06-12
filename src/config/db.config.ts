import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const configService = new ConfigService();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: configService.get<string>('DB_USER') || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || 'django1234',
  database: configService.get<string>('DB_NAME') || 'postgres',
  autoLoadEntities: true,
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
};


export { typeOrmConfig };
