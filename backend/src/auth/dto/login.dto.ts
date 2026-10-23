import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '1098765432' })
  @IsString()
  documento: string;

  @ApiProperty({ example: 'claveSegura123' })
  @IsString()
  @MinLength(6)
  password: string;
}
