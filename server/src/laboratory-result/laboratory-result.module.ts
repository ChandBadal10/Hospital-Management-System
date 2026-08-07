import { Module } from '@nestjs/common';
import { LaboratoryResultController } from './laboratory-result.controller';
import { LaboratoryResultService } from './laboratory-result.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LaboratoryResult, LaboratoryResultSchema } from './schemas/laboratory-result.schema';
import { LaboratoryOrder, LaboratoryOrderSchema } from 'src/laboratory-orders/schemas/laboratory-order.schema';
import { Laboratory, LaboratorySchema } from 'src/laboratories/schemas/laboratory.schema';
import { Patient, PatientSchema } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorSchema } from 'src/doctors/schemas/doctor.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LaboratoryResult.name,
        schema: LaboratoryResultSchema
      },
      {
        name: LaboratoryOrder.name,
        schema: LaboratoryOrderSchema
      },
      {
        name: Laboratory.name,
        schema: LaboratorySchema
      },
      {
        name: Patient.name,
        schema: PatientSchema
      },
      {
        name: Doctor.name,
        schema: DoctorSchema
      },
      {
        name: User.name,
        schema: UserSchema
      }
    ])
  ],
  controllers: [LaboratoryResultController],
  providers: [LaboratoryResultService]
})
export class LaboratoryResultModule {}
