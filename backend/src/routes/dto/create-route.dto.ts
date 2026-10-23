import { IsString, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ example: 'MAN-2026-BOG-MED-04' })
  @IsString()
  @IsOptional()
  codigoManifiesto?: string;

  @ApiProperty({ example: 'Terminal de Carga Bogotá' })
  @IsString()
  origenNombre: string;

  @ApiProperty({ example: 4.6097 })
  @IsNumber()
  origenLat: number;

  @ApiProperty({ example: -74.0817 })
  @IsNumber()
  origenLon: number;

  @ApiProperty({ example: 'Zona Industrial Medellín' })
  @IsString()
  destinoNombre: string;

  @ApiProperty({ example: 6.2442 })
  @IsNumber()
  destinoLat: number;

  @ApiProperty({ example: -75.5812 })
  @IsNumber()
  destinoLon: number;

  @ApiProperty({ example: '2026-10-23T18:00:00Z' })
  @IsDateString()
  etaPactado: string;

  @ApiProperty({ example: 415.5 })
  @IsNumber()
  distanciaTotalKm: number;

  @ApiProperty({ example: 480 })
  @IsNumber()
  tiempoEstimadoBaseMin: number;
}
