import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
  password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
  database: configService.get<string>('DATABASE_NAME', 'ecommerce'),
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? {
    rejectUnauthorized: false
  } : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
