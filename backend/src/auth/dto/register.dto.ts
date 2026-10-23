import { IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../shared/types';

export class RegisterDto {
  @ApiProperty({ example: 'Carlos Gómez' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '1098765432' })
  @IsString()
  documento: string;

  @ApiProperty({ example: 'claveSegura123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.DRIVER })
  @IsEnum(UserRole)
  rol: UserRole;
}
