import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteEntity } from './entities/route.entity';
import { RouteSegmentEntity } from './entities/route-segment.entity';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { DelayEngineModule } from '../delay-engine/delay-engine.module';
import { RoadIncidentsModule } from '../road-incidents/road-incidents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteEntity, RouteSegmentEntity]),
    DelayEngineModule,
    RoadIncidentsModule,
  ],
  providers: [RoutesService],
  controllers: [RoutesController],
  exports: [RoutesService],
})
export class RoutesModule {}
