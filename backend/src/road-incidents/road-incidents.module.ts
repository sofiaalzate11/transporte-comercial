import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadIncidentEntity } from './entities/road-incident.entity';
import { RoadIncidentsService } from './road-incidents.service';
import { RoadIncidentsController } from './road-incidents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoadIncidentEntity])],
  providers: [RoadIncidentsService],
  controllers: [RoadIncidentsController],
  exports: [RoadIncidentsService],
})
export class RoadIncidentsModule {}
