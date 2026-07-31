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
import { UpdatePatientDto } from './dto/update-patient.dto';




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


    // Update Patient by Id
    async updatePatient(id: string, updatePatientDto: UpdatePatientDto, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Patient ID");
        }

        const patient = await this.patientModel.findById(id);
        if(!patient) {
            throw new BadRequestException("Patient not found")
        }

        const patientUser = await this.userModel.findById(patient.user);

        if(!patientUser) {
            throw new BadRequestException("User not found");
        }

        //Update User Information
        if(updatePatientDto.firstName) {
            patientUser.firstName = updatePatientDto.firstName;
        }

        if(updatePatientDto.lastName) {
            patientUser.lastName = updatePatientDto.lastName;
        }

        if(updatePatientDto.email) {
            const existingEmail = await this.userModel.findOne({
                email: updatePatientDto.email,
                _id: {$ne: patientUser._id},
            });
        if(existingEmail) {
            throw new BadRequestException("Email already exists")
        }
        patientUser.email = updatePatientDto.email;
        }


        if(updatePatientDto.phone) {
        patientUser.phone = updatePatientDto.phone;
        }

        await patientUser.save();



        // Update Patient Information

        if (updatePatientDto.gender) {
            patient.gender = updatePatientDto.gender;
        }

        if (updatePatientDto.bloodGroup) {
            patient.bloodGroup = updatePatientDto.bloodGroup;
        }

        if (updatePatientDto.dateOfBirth) {
            patient.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
        }

        if (updatePatientDto.height !== undefined) {
            patient.height = updatePatientDto.height;
        }

        if (updatePatientDto.weight !== undefined) {
            patient.weight = updatePatientDto.weight;
        }

        if (updatePatientDto.emergencyContactName) {
            patient.emergencyContactName =
            updatePatientDto.emergencyContactName;
        }

        if (updatePatientDto.emergencyContactNumber) {
            patient.emergencyContactNumber =
            updatePatientDto.emergencyContactNumber;
        }

        if (updatePatientDto.address) {
            patient.address = updatePatientDto.address;
        }

        if (updatePatientDto.city) {
            patient.city = updatePatientDto.city;
        }

        if (updatePatientDto.state) {
            patient.state = updatePatientDto.state;
        }

        if (updatePatientDto.country) {
            patient.country = updatePatientDto.country;
        }

        if (updatePatientDto.profileImage !== undefined) {
            patient.profileImage = updatePatientDto.profileImage;
        }

        if (updatePatientDto.allergies) {
            patient.allergies = updatePatientDto.allergies;
        }

        if (updatePatientDto.medicalHistory) {
            patient.medicalHistory = updatePatientDto.medicalHistory;
        }

        patient.updatedBy = user.id as any;

        await patient.save();

        const updatePatient = await this.patientModel
        .findById(patient._id)
        .populate("user", "firstName lastName email phone")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

        return {
            success: true,
            message: "Patient updated successfully",
            data: updatePatient,
        }
    }
}