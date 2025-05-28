import { PartialType } from '@nestjs/swagger';
import { CreateAuthDto } from './register-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
