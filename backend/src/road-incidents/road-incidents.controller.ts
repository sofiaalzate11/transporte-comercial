import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoadIncidentsService } from './road-incidents.service';

@ApiTags('Incidentes Viales')
@Controller('road-incidents')
export class RoadIncidentsController {
  constructor(private readonly incidentsService: RoadIncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar todos los incidentes viales activos en Colombia' })
  async getAllActive() {
    return this.incidentsService.findAllActive();
  }

  @Get('by-road/:code')
  @ApiOperation({ summary: 'Consultar incidentes viales activos en una vía específica' })
  async getByRoad(@Param('code') code: string) {
    return this.incidentsService.findByRoadCode(code);
  }

  @Post('sync/invias')
  @ApiOperation({ summary: 'Disparar sincronización de novedades con fuentes de INVIAS' })
  @ApiResponse({ status: 200, description: 'Sincronización completada' })
  async syncInvias() {
    return this.incidentsService.syncFromInviasMock();
  }
}
