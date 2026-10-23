import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteEntity } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { DelayEngineService } from '../delay-engine/delay-engine.service';
import { RoadIncidentsService } from '../road-incidents/road-incidents.service';
import { IDelayEvaluationResult, RouteStatus } from '../shared/types';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(RouteEntity)
    private readonly routeRepository: Repository<RouteEntity>,
    private readonly delayEngineService: DelayEngineService,
    private readonly roadIncidentsService: RoadIncidentsService,
  ) {}

  async create(dto: CreateRouteDto): Promise<RouteEntity> {
    const route = this.routeRepository.create({
      usuarioId: dto.usuarioId,
      codigoManifiesto: dto.codigoManifiesto,
      origenNombre: dto.origenNombre,
      origenLat: dto.origenLat,
      origenLon: dto.origenLon,
      destinoNombre: dto.destinoNombre,
      destinoLat: dto.destinoLat,
      destinoLon: dto.destinoLon,
      etaPactado: new Date(dto.etaPactado),
      distanciaTotalKm: dto.distanciaTotalKm,
      tiempoEstimadoBaseMin: dto.tiempoEstimadoBaseMin,
      estado: RouteStatus.PENDING,
    });
    return this.routeRepository.save(route);
  }

  async findAll(): Promise<RouteEntity[]> {
    return this.routeRepository.find({
      relations: ['tramos', 'usuario'],
      order: { etaPactado: 'ASC' },
    });
  }

  async findById(id: string): Promise<RouteEntity> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['tramos', 'telemetria', 'usuario'],
    });
    if (!route) {
      throw new NotFoundException(`Ruta ${id} no encontrada`);
    }
    return route;
  }

  async evaluateDelay(routeId: string): Promise<IDelayEvaluationResult> {
    const route = await this.findById(routeId);
    const incidents = await this.roadIncidentsService.findAllActive();
    const evaluation = this.delayEngineService.evaluateRouteDelay(route, incidents);

    if (evaluation.isDelayed) {
      route.estado = RouteStatus.DELAYED;
      route.etaRecalculado = new Date(evaluation.recalculatedEta);
      await this.routeRepository.save(route);
    }

    return evaluation;
  }
}
