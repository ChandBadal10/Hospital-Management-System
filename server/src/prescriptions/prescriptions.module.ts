import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Prescription, PrescriptionSchema } from './schemas/prescription.schema';
import { MedicalRecord, MedicalRecordSchema } from 'src/medical-records/schemas/medical-record.schema';
import { Patient, PatientSchema } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorSchema } from 'src/doctors/schemas/doctor.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Appointment, AppointmentSchema } from 'src/appointments/schemas/appointment.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name: Prescription.name,
        schema: PrescriptionSchema
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
        name: Appointment.name,
        schema: AppointmentSchema
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
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService]
})
export class PrescriptionsModule {}
