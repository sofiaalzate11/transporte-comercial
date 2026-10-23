import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RouteEntity } from '../../routes/entities/route.entity';

@Entity('telemetria_puntos')
export class TelemetryPointEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'ruta_id' })
  rutaId: string;

  @ManyToOne(() => RouteEntity, (route) => route.telemetria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruta_id' })
  ruta: RouteEntity;

  @Column({ type: 'double precision' })
  latitud: number;

  @Column({ type: 'double precision' })
  longitud: number;

  @Column({ name: 'velocidad_kmh', type: 'double precision', nullable: true })
  velocidadKmh: number;

  @Column({ type: 'double precision', nullable: true })
  altitud: number;

  @Column({ name: 'bateria_nivel', type: 'double precision', nullable: true })
  bateriaNivel: number;

  @Column({ name: 'timestamp_captura', type: 'timestamp' })
  timestampCaptura: Date;
}
