import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/users/enums/role.enum';
import { GetPatientsQueryDto } from './dto/get-patients-query.dto';




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


    //Get all Patients
    async getAllPatients(query: GetPatientsQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: any = {
            isActive: true,
        };

        if (query.search) {
            const users = await this.userModel.find({
            $or: [
                {
                firstName: {
                    $regex: query.search,
                    $options: "i",
                },
                },
                {
                lastName: {
                    $regex: query.search,
                    $options: "i",
                },
                },
                {
                email: {
                    $regex: query.search,
                    $options: "i",
                },
                },
            ],
            });

            filter.user = {
            $in: users.map((u) => u._id),
            };
        }

        const patients = await this.patientModel
            .find(filter)
            .populate(
            "user",
            "firstName lastName email phone",
            )
            .populate(
            "createdBy",
            "firstName lastName",
            )
            .populate(
            "updatedBy",
            "firstName lastName",
            )
            .skip(skip)
            .limit(limit)
            .sort({
            createdAt: -1,
            });

        const total = await this.patientModel.countDocuments(
            filter,
        );

        return {
            success: true,
            message: "Patients fetched successfully",
            data: patients,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
}


    //Get patient By Id
    async getPatientById(id: string) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Patient ID");
        }

        const patient = await this.patientModel.findById(id)
        .populate("user", "firstName lastName email phone")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")

        if(!patient) {
            throw new BadRequestException("Patient not found")
        }

        return {
            success: true,
            message: "Patient fetched successfully",
            data: patient
        }
    }
}