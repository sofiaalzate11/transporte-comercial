import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IncidentType, IncidentSeverity } from '../../shared/types';

@Entity('incidentes_viales')
export class RoadIncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'id_fuente_externa', type: 'varchar', length: 100, nullable: true })
  idFuenteExterna: string;

  @Column({
    name: 'tipo_evento',
    type: 'enum',
    enum: IncidentType,
  })
  tipoEvento: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
    default: IncidentSeverity.MEDIUM,
  })
  gravedad: IncidentSeverity;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'via_codigo', type: 'varchar', length: 50, nullable: true })
  viaCodigo: string;

  @Column({ type: 'double precision' })
  latitud: number;

  @Column({ type: 'double precision' })
  longitud: number;

  @Column({ name: 'radio_afectacion_km', type: 'double precision', default: 1.0 })
  radioAfectacionKm: number;

  @Column({ name: 'retraso_estimado_min', type: 'int', default: 0 })
  retrasoEstimadoMin: number;

  @Column({ type: 'varchar', length: 50 })
  fuente: string;

  @Column({ type: 'varchar', length: 30, default: 'activo' })
  estado: string;

  @Column({ name: 'fecha_reporte', type: 'timestamp' })
  fechaReporte: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
