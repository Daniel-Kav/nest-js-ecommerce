import { Injectable } from '@nestjs/common';
import { CreateLoggerDto } from './dto/create-logger.dto';
import { UpdateLoggerDto } from './dto/update-logger.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logDir = path.resolve(__dirname, '../../logs');
  private errorLogPath = path.join(this.logDir, 'error.log');

  constructor() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  logError(error: any) {
    const logEntry = `[${new Date().toISOString()}] ${typeof error === 'string' ? error : JSON.stringify(error, null, 2)}\n`;
    fs.appendFileSync(this.errorLogPath, logEntry, { encoding: 'utf8' });
  }

  create(createLoggerDto: CreateLoggerDto) {
    return 'This action adds a new logger';
  }

  findAll() {
    return `This action returns all logger`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logger`;
  }

  update(id: number, updateLoggerDto: UpdateLoggerDto) {
    return `This action updates a #${id} logger`;
  }

  remove(id: number) {
    return `This action removes a #${id} logger`;
  }
}
