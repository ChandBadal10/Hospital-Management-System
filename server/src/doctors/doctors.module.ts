import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from './schemas/doctor.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Department, DepartmentSchema } from 'src/departments/schemas/department.schema';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Doctor.name,
        schema: DoctorSchema
      },
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Department.name,
        schema: DepartmentSchema
      }
    ]),
    MailModule
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService]
})
export class DoctorsModule {}
