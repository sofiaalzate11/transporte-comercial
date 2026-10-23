import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { IngestTelemetryBatchDto } from './dto/ingest-telemetry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Telemetría GPS')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ingesta masiva de puntos GPS acumulados sin conexión' })
  async ingestBatch(@Body() dto: IngestTelemetryBatchDto) {
    return this.telemetryService.ingestBatch(dto);
  }

  @Get('route/:routeId/recent')
  @ApiOperation({ summary: 'Obtener los últimos puntos GPS registrados para una ruta' })
  async getRecent(@Param('routeId') routeId: string) {
    return this.telemetryService.getRecentPoints(routeId);
  }
}
