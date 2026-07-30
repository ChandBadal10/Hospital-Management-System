import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema
      },

      {
        name: User.name,
        schema: UserSchema
      }
    ]),
    MailModule
  ],
  controllers: [PatientsController],
  providers: [PatientsService]
})
export class PatientsModule {}
