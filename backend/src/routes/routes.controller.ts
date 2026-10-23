import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Rutas de Entrega')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva orden de transporte / ruta' })
  @ApiResponse({ status: 201, description: 'Ruta creada exitosamente' })
  async create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las rutas registradas' })
  async findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de una ruta con sus tramos' })
  async findById(@Param('id') id: string) {
    return this.routesService.findById(id);
  }

  @Post(':id/evaluate-delay')
  @ApiOperation({ summary: 'Calcular delta de retraso analítico cruzando tramos con incidentes' })
  async evaluateDelay(@Param('id') id: string) {
    return this.routesService.evaluateDelay(id);
  }
}
