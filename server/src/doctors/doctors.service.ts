import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Department, DepartmentDocument } from 'src/departments/schemas/department.schema';
import { MailService } from 'src/mail/mail.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/users/enums/role.enum';
import { UpdateDoctorDto } from './dto/update-doctor.dot';



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


    //Get All Doctors
    async getAllDoctors() {
        const doctors = await this.doctorModel
        .find({isActive: true})
        .populate("user", "firstName lastName email phone")
        .populate("departmentId", "name description")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")
        .sort({ createdAt: -1 });


        return {
            success: true,
            message: "Doctors fetched successfully",
            data: doctors
        }
    }



    //Get doctor by id
    async getDoctorById(id: string) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Doctor ID")
        }

        const doctor = await this.doctorModel.findById(id)
        .populate("user", "firstName lastName email phone")
        .populate("departmentId", "name description")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

        if(!doctor) {
            throw new BadRequestException("Doctor not found");
        }

        return {
            success: true,
            message: "Doctor Fetched successfully",
            data: doctor
        }

    }

    //Update Doctor info
    async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Doctor Id")
        }

        const doctor = await this.doctorModel.findById(id);
        if(!doctor) {
            throw new BadRequestException("Doctor not found");
        }

        const doctorUser = await this.userModel.findById(doctor.user);

        if(!doctorUser) {
            throw new BadRequestException("User not found");
        }

        if(updateDoctorDto.firstName) {
            doctorUser.firstName = updateDoctorDto.firstName;
        }

        if(updateDoctorDto.lastName) {
            doctorUser.lastName = updateDoctorDto.lastName;
        }

        if(updateDoctorDto.email) {
            doctorUser.email = updateDoctorDto.email;
        }

        if(updateDoctorDto.phone) {
            doctorUser.phone = updateDoctorDto.phone;
        }


        await doctorUser.save();


        if(updateDoctorDto.departmentId) {
            const department = await this.departmentModel.findById(
                updateDoctorDto.departmentId
            )

            if(!department) {
                throw new BadRequestException("Department not found")
            }

            doctor.departmentId = department._id;
        }

        if(updateDoctorDto.specialization) {
            doctor.specialization = updateDoctorDto.specialization;
        }

        if(updateDoctorDto.qualification) {
            doctor.qualification = updateDoctorDto.qualification;
        }

        if(updateDoctorDto.experience !== undefined) {
            doctor.experience = updateDoctorDto.experience;
        }


        if(updateDoctorDto.consultationFee !== undefined) {
            doctor.consultationFee = updateDoctorDto.consultationFee;
        }


        if(updateDoctorDto.licenseNumber) {
            doctor.licenseNumber = updateDoctorDto.licenseNumber;
        }

        if(updateDoctorDto.bio) {
            doctor.bio = updateDoctorDto.bio;
        }

        if(updateDoctorDto.availableDays) {
            doctor.availableDays = updateDoctorDto.availableDays;
        }

        if(updateDoctorDto.startTime || updateDoctorDto.endTime) {
            doctor.availableTime = {
                startTime: updateDoctorDto.startTime ?? doctor.availableTime.startTime,

                endTime: updateDoctorDto.endTime ?? doctor.availableTime.endTime,
            }
        }

        doctor.updatedBy = new Types.ObjectId(user.id);

        await doctor.save();

        const updatedDoctor = await this.doctorModel
        .findById(doctor._id)
        .populate("user", "firstName lastName email phone")
        .populate("departmentId", "name description")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

        return {
        success: true,
        message: "Doctor updated successfully",
        data: updatedDoctor,
        };
    }


    //Delete Doctor
    async deleteDoctor(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Doctor ID");
        }

        const doctor = await this.doctorModel.findById(id);

        if(!doctor) {
            throw new BadRequestException("Doctor not found");
        }

        if(!doctor.isActive) {
            throw new BadRequestException("Doctor already deleted");
        }

        //Find user
        const doctorUser = await this.userModel.findById(doctor.user);

        if(!doctorUser) {
            throw new BadRequestException("User not found")
        }


        doctor.isActive = false;
        doctor.updatedBy = new Types.ObjectId(user.id);

        doctorUser.isActive = false;

        await doctor.save();
        await doctorUser.save();

        return {
            success: true,
            message: "Doctor deleted successfully",
        }
    }


    //Restore Doctor
    async restoreDoctor(id: string, user: CurrentUser) {
        // Validate Id
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Doctor ID")
        }


        //Find Doctor
        const doctor = await this.doctorModel.findById(id);

        if(!doctor) {
            throw new BadRequestException("Doctor not found");
        }

        //Already Active
        if(doctor.isActive) {
            throw new BadRequestException("Doctor is already active")
        }

        //Find user
        const doctorUser = await this.userModel.findById(doctor.user);

        if(!doctorUser) {
            throw new BadRequestException("User not found")
        }

        //Restore
        doctor.isActive = true;
        doctor.updatedBy = new Types.ObjectId(user.id)

        doctorUser.isActive = true;

        //Save
        await doctor.save()
        await doctorUser.save();

        return {
            success: true,
            message: "Doctor restored successfully",
        }
    }
}