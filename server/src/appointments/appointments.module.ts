import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { MongooseModule } from '@nestjs/mongoose';
import {  Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { Doctor, DoctorSchema } from 'src/doctors/schemas/doctor.schema';
import { Department, DepartmentSchema } from 'src/departments/schemas/department.schema';
import { Patient, PatientSchema } from 'src/patients/schemas/patient.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';




@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Appointment.name,
        schema: AppointmentSchema
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
        name: Department.name,
        schema: DepartmentSchema
      },
      {
        name: User.name,
        schema: UserSchema
      },
    ])
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService]
})
export class AppointmentsModule {}
