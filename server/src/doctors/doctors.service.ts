import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Department, DepartmentDocument } from 'src/departments/schemas/department.schema';
import { MailService } from 'src/mail/mail.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/users/enums/role.enum';



@Injectable()
export class DoctorsService {
    constructor(
        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<DoctorDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Department.name)
        private readonly departmentModel: Model<DepartmentDocument>,

        private readonly mailService: MailService,
    ) {}

    //Create doctor

    async createDoctor(createDoctorDto: CreateDoctorDto, user: CurrentUser) {
        const existingUser = await this.userModel.findOne({
            email: createDoctorDto.email
        });

        if(existingUser) {
            throw new BadRequestException("Email already exists")
        }

        const department = await this.departmentModel.findById(createDoctorDto.departmentId);

        if(!department) {
            throw new BadRequestException("Department not found")
        }

        const temporaryPassword = "DOC@" + Math.floor(100000 + Math.random() * 900000);

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const newUser = await this.userModel.create({
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            email: createDoctorDto.email,
            password: hashedPassword,
            phone: createDoctorDto.phone,
            role: Role.DOCTOR,
        })

        const doctor = await this.doctorModel.create({
        user: newUser._id,
        departmentId: department._id,
        specialization: createDoctorDto.specialization,
        qualification: createDoctorDto.qualification,
        experience: createDoctorDto.experience,
        consultationFee: createDoctorDto.consultationFee,
        licenseNumber: createDoctorDto.licenseNumber,
        availableDays: createDoctorDto.availableDays,
        availableTime: {
        startTime: createDoctorDto.startTime,
        endTime: createDoctorDto.endTime,
        },
        bio: createDoctorDto.bio,
        createdBy: user.id,
        updatedBy: user.id,
        });

        await this.mailService.sendDoctorCredentials(
        newUser.email,
        temporaryPassword,
        );

        return {
        success: true,
        message: "Doctor created successfully",
        data: doctor,
        };
    }

}
