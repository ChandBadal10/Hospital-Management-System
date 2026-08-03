import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordSchema } from './schemas/medical-record.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Appointment, AppointmentSchema } from 'src/appointments/schemas/appointment.schema';
import { Doctor, DoctorSchema } from 'src/doctors/schemas/doctor.schema';
import { Patient, PatientSchema } from 'src/patients/schemas/patient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MedicalRecord.name,
        schema: MedicalRecordSchema
      },
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Appointment.name,
        schema: AppointmentSchema
      },

      {
        name: Doctor.name,
        schema: DoctorSchema
      },

      {
        name: Patient.name,
        schema: PatientSchema
      }
    ])
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService]
})
export class MedicalRecordsModule {}
