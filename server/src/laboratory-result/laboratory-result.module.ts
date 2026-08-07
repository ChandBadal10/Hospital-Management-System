import { Module } from '@nestjs/common';
import { LaboratoryResultController } from './laboratory-result.controller';
import { LaboratoryResultService } from './laboratory-result.service';

@Module({
  controllers: [LaboratoryResultController],
  providers: [LaboratoryResultService]
})
export class LaboratoryResultModule {}
