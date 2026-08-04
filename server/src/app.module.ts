import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { DepartmentsModule } from './departments/departments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management'),

    AuthModule,
    UsersModule,
    MailModule,
    DepartmentsModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PrescriptionsModule
  ],
})
export class AppModule {}