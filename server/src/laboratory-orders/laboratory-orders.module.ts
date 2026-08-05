import { Module } from '@nestjs/common';
import { LaboratoryOrdersController } from './laboratory-orders.controller';
import { LaboratoryOrdersService } from './laboratory-orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LaboratoryOrder, LaboratoryOrderSchema } from './schemas/laboratory-order.schema';
import { Appointment, AppointmentSchema } from 'src/appointments/schemas/appointment.schema';
import { MedicalRecord, MedicalRecordSchema } from 'src/medical-records/schemas/medical-record.schema';
import { Patient, PatientSchema } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorSchema } from 'src/doctors/schemas/doctor.schema';
import { LaboratoryTest, LaboratoryTestSchema } from 'src/laboratory-tests/schemas/laboratory-test.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LaboratoryOrder.name,
        schema: LaboratoryOrderSchema
      },
      {
        name: Appointment.name,
        schema: AppointmentSchema
      },

      {
        name: MedicalRecord.name,
        schema: MedicalRecordSchema
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
        name: LaboratoryTest.name,
        schema: LaboratoryTestSchema
      },

      {
        name: User.name,
        schema: UserSchema
      }
    ])
  ],
  controllers: [LaboratoryOrdersController],
  providers: [LaboratoryOrdersService]
})
export class LaboratoryOrdersModule {}
