import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryPointEntity } from './entities/telemetry-point.entity';
import { IngestTelemetryBatchDto } from './dto/ingest-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(TelemetryPointEntity)
    private readonly telemetryRepo: Repository<TelemetryPointEntity>,
  ) {}

  async ingestBatch(dto: IngestTelemetryBatchDto): Promise<{ savedCount: number }> {
    const entities = dto.points.map((p) =>
      this.telemetryRepo.create({
        rutaId: dto.routeId,
        latitud: p.latitude,
        longitud: p.longitude,
        velocidadKmh: p.speedKmh,
        altitud: p.altitude,
        bateriaNivel: p.batteryLevel,
        timestampCaptura: new Date(p.capturedAt),
      }),
    );

    await this.telemetryRepo.save(entities);
    return { savedCount: entities.length };
  }

  async getRecentPoints(routeId: string, limit = 50): Promise<TelemetryPointEntity[]> {
    return this.telemetryRepo.find({
      where: { rutaId: routeId },
      order: { timestampCaptura: 'DESC' },
      take: limit,
    });
  }
}
