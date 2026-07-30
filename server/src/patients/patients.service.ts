import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/users/enums/role.enum';




@Injectable()
export class PatientsService {
    constructor(
        @InjectModel(Patient.name)
        private readonly patientModel: Model<PatientDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly mailService: MailService,
    ) {}

    private async generatePatientId(): Promise<string> {
    const count = await this.patientModel.countDocuments();

    return `PAT${String(count + 1).padStart(6, "0")}`;
    }


    //Create Patient
    async createPatient(createPatientDto: CreatePatientDto, user: CurrentUser) {
        // check if email already exists
        const existingUser = await this.userModel.findOne({
            email: createPatientDto.email
        });

        if(existingUser) {
            throw new BadRequestException("Email already exists");
        }

        //Generate Patient ID
        const patientId = await this.generatePatientId();

        //Generate temporary passsword
        const temporaryPassword = "PAT@" + Math.floor(100000 + Math.random() * 900000);

        //Hashed Password
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // Create User
        const newUser = await this.userModel.create({
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        email: createPatientDto.email,
        password: hashedPassword,
        phone: createPatientDto.phone,
        role: Role.PATIENT,
    });

    // Create Patient Profile
    const patient = await this.patientModel.create({
    user: newUser._id,
    patientId,

    dateOfBirth: createPatientDto.dateOfBirth,
    gender: createPatientDto.gender,
    bloodGroup: createPatientDto.bloodGroup,
    height: createPatientDto.height,
    weight: createPatientDto.weight,

    emergencyContactName:
      createPatientDto.emergencyContactName,
    emergencyContactNumber:
      createPatientDto.emergencyContactNumber,

    address: createPatientDto.address,
    city: createPatientDto.city,
    state: createPatientDto.state,
    country: createPatientDto.country,

    profileImage: createPatientDto.profileImage,

    allergies: createPatientDto.allergies,

    medicalHistory: createPatientDto.medicalHistory,

    createdBy: user.id,
    updatedBy: user.id,
  });

  // Send Credentials
  await this.mailService.sendPatientCredentials(
    newUser.email,
    temporaryPassword,
  );

  return {
    success: true,
    message: "Patient created successfully",
    data: patient,
  };
}
}