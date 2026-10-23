import { IsUUID, IsArray, ValidateNested, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TelemetryPointDto {
  @ApiProperty({ example: 4.7110 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0721 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 65.5 })
  @IsNumber()
  @IsOptional()
  speedKmh?: number;

  @ApiProperty({ example: 2600 })
  @IsNumber()
  @IsOptional()
  altitude?: number;

  @ApiProperty({ example: 88.0 })
  @IsNumber()
  @IsOptional()
  batteryLevel?: number;

  @ApiProperty({ example: '2026-10-23T05:00:00Z' })
  @IsDateString()
  capturedAt: string;
}

export class IngestTelemetryBatchDto {
  @ApiProperty({ example: 'b567d28c-02cf-4b13-9a3b-28f09623cb21' })
  @IsUUID()
  routeId: string;

  @ApiProperty({ type: [TelemetryPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelemetryPointDto)
  points: TelemetryPointDto[];
}
