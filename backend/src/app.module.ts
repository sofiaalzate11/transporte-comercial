import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RoutesModule } from './routes/routes.module';
import { RoadIncidentsModule } from './road-incidents/road-incidents.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { DelayEngineModule } from './delay-engine/delay-engine.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    RoutesModule,
    RoadIncidentsModule,
    TelemetryModule,
    DelayEngineModule,
  ],
})
export class AppModule {}
