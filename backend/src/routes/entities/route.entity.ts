import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RouteStatus } from '../../shared/types';
import { UserEntity } from '../../users/entities/user.entity';
import { RouteSegmentEntity } from './route-segment.entity';
import { TelemetryPointEntity } from '../../telemetry/entities/telemetry-point.entity';

@Entity('rutas_entrega')
export class RouteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => UserEntity, (user) => user.rutas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity;

  @Column({ name: 'codigo_manifiesto', type: 'varchar', length: 100, nullable: true })
  codigoManifiesto: string;

  @Column({ name: 'origen_nombre', type: 'varchar', length: 150 })
  origenNombre: string;

  @Column({ name: 'origen_lat', type: 'double precision' })
  origenLat: number;

  @Column({ name: 'origen_lon', type: 'double precision' })
  origenLon: number;

  @Column({ name: 'destino_nombre', type: 'varchar', length: 150 })
  destinoNombre: string;

  @Column({ name: 'destino_lat', type: 'double precision' })
  destinoLat: number;

  @Column({ name: 'destino_lon', type: 'double precision' })
  destinoLon: number;

  @Column({ name: 'eta_pactado', type: 'timestamp' })
  etaPactado: Date;

  @Column({ name: 'eta_recalculado', type: 'timestamp', nullable: true })
  etaRecalculado: Date;

  @Column({ name: 'distancia_total_km', type: 'double precision' })
  distanciaTotalKm: number;

  @Column({ name: 'tiempo_estimado_base_min', type: 'int' })
  tiempoEstimadoBaseMin: number;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.PENDING,
  })
  estado: RouteStatus;

  @OneToMany(() => RouteSegmentEntity, (segment) => segment.ruta, { cascade: true })
  tramos: RouteSegmentEntity[];

  @OneToMany(() => TelemetryPointEntity, (telemetry) => telemetry.ruta)
  telemetria: TelemetryPointEntity[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
