import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadIncidentEntity } from './entities/road-incident.entity';

@Injectable()
export class RoadIncidentsService {
  constructor(
    @InjectRepository(RoadIncidentEntity)
    private readonly incidentRepository: Repository<RoadIncidentEntity>,
  ) {}

  async findAllActive(): Promise<RoadIncidentEntity[]> {
    return this.incidentRepository.find({
      where: { estado: 'activo' },
      order: { fechaReporte: 'DESC' },
    });
  }

  async findByRoadCode(viaCodigo: string): Promise<RoadIncidentEntity[]> {
    return this.incidentRepository.find({
      where: { viaCodigo, estado: 'activo' },
    });
  }

  async create(data: Partial<RoadIncidentEntity>): Promise<RoadIncidentEntity> {
    const incident = this.incidentRepository.create(data);
    return this.incidentRepository.save(incident);
  }

  async syncFromInviasMock(): Promise<{ count: number }> {
    // Sincronización base para pruebas de aula con datos oficiales de referencia
    const mockData = [
      {
        idFuenteExterna: 'INV-2026-001',
        tipoEvento: 'derrumbe' as any,
        gravedad: 'critica' as any,
        descripcion: 'Cierre total por remoción en masa en el km 42',
        viaCodigo: 'Ruta 40 (Bogotá - Girardot)',
        latitud: 4.4532,
        longitud: -74.4512,
        radioAfectacionKm: 2.5,
        retrasoEstimadoMin: 180,
        fuente: 'INVIAS_HERMES_767',
        estado: 'activo',
        fechaReporte: new Date(),
      },
      {
        idFuenteExterna: 'INV-2026-002',
        tipoEvento: 'paso_a_un_carril' as any,
        gravedad: 'media' as any,
        descripcion: 'Mantenimiento preventivo en zona de bermas',
        viaCodigo: 'Ruta 25 (Medellín - Manizales)',
        latitud: 5.4821,
        longitud: -75.5213,
        radioAfectacionKm: 1.0,
        retrasoEstimadoMin: 45,
        fuente: 'INVIAS_HERMES_767',
        estado: 'activo',
        fechaReporte: new Date(),
      },
    ];

    for (const item of mockData) {
      const exists = await this.incidentRepository.findOne({
        where: { idFuenteExterna: item.idFuenteExterna },
      });
      if (!exists) {
        await this.incidentRepository.save(this.incidentRepository.create(item));
      }
    }

    return { count: mockData.length };
  }
}
