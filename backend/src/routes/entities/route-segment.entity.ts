import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RouteEntity } from './route.entity';

@Entity('tramos_ruta')
export class RouteSegmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ruta_id' })
  rutaId: string;

  @ManyToOne(() => RouteEntity, (route) => route.tramos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruta_id' })
  ruta: RouteEntity;

  @Column({ name: 'orden_secuencia', type: 'int' })
  ordenSecuencia: number;

  @Column({ name: 'origen_lat', type: 'double precision' })
  origenLat: number;

  @Column({ name: 'origen_lon', type: 'double precision' })
  origenLon: number;

  @Column({ name: 'destino_lat', type: 'double precision' })
  destinoLat: number;

  @Column({ name: 'destino_lon', type: 'double precision' })
  destinoLon: number;

  @Column({ name: 'via_codigo', type: 'varchar', length: 50, nullable: true })
  viaCodigo: string;

  @Column({ name: 'distancia_km', type: 'double precision' })
  distanciaKm: number;

  @Column({ name: 'tiempo_base_min', type: 'int' })
  tiempoBaseMin: number;
}
