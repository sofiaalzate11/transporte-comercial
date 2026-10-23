import { Module } from '@nestjs/common';
import { DelayEngineService } from './delay-engine.service';

@Module({
  providers: [DelayEngineService],
  exports: [DelayEngineService],
})
export class DelayEngineModule {}
