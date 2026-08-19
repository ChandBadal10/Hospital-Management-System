import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { Model, Types, Connection } from 'mongoose';
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

    @InjectConnection()
    private readonly connection: Connection,

    private readonly mailService: MailService,
  ) {}

  // Create Doctor
  async createDoctor(createDoctorDto: CreateDoctorDto, user: CurrentUser) {
    const existingUser = await this.userModel.findOne({
      email: createDoctorDto.email,
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const existingLicense = await this.doctorModel.findOne({
      licenseNumber: createDoctorDto.licenseNumber,
    });

    if (existingLicense) {
      throw new BadRequestException('License number already exists');
    }

    const department = await this.departmentModel.findById(createDoctorDto.departmentId);

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const temporaryPassword = 'DOC@' + Math.floor(100000 + Math.random() * 900000);
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const [newUser] = await this.userModel.create(
        [
          {
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            email: createDoctorDto.email,
            password: hashedPassword,
            phone: createDoctorDto.phone,
            role: Role.DOCTOR,
          },
        ],
        { session },
      );

      const [doctor] = await this.doctorModel.create(
        [
          {
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
            bio: createDoctorDto.bio ?? '',
            createdBy: user.id,
            updatedBy: user.id,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      // Send credentials asynchronously after transaction commits successfully
      await this.mailService.sendDoctorCredentials(
        newUser.email,
        temporaryPassword,
      );

      return {
        success: true,
        message: 'Doctor created successfully',
        data: doctor,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Get All Doctors
  async getAllDoctors() {
    const doctors = await this.doctorModel
      .find({ isActive: true })
      .populate('user', 'firstName lastName email phone')
      .populate('departmentId', 'name description')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: 'Doctors fetched successfully',
      data: doctors,
    };
  }

  // Get Doctor Dashboard Stats
  async getDoctorStats(currentUser: CurrentUser) {
    const doctor = await this.doctorModel.findOne({ user: currentUser.id });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return {
      success: true,
      data: {
        doctorId: doctor._id,
        specialization: doctor.specialization,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        availableDays: doctor.availableDays,
        availableTime: doctor.availableTime,
      },
    };
  }

  // Get Doctor By ID
  async getDoctorById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Doctor ID');
    }

    const doctor = await this.doctorModel
      .findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('departmentId', 'name description')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      success: true,
      message: 'Doctor fetched successfully',
      data: doctor,
    };
  }

  // Update Doctor Info
  async updateDoctor(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
    user: CurrentUser,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Doctor ID');
    }

    const doctor = await this.doctorModel.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const doctorUser = await this.userModel.findById(doctor.user);
    if (!doctorUser) {
      throw new NotFoundException('Associated User not found');
    }

    if (updateDoctorDto.licenseNumber && updateDoctorDto.licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await this.doctorModel.findOne({
        licenseNumber: updateDoctorDto.licenseNumber,
      });
      if (existingLicense) {
        throw new BadRequestException('License number already in use');
      }
      doctor.licenseNumber = updateDoctorDto.licenseNumber;
    }

    if (updateDoctorDto.email && updateDoctorDto.email !== doctorUser.email) {
      const existingEmail = await this.userModel.findOne({
        email: updateDoctorDto.email,
      });
      if (existingEmail) {
        throw new BadRequestException('Email already in use');
      }
      doctorUser.email = updateDoctorDto.email;
    }

    if (updateDoctorDto.firstName) doctorUser.firstName = updateDoctorDto.firstName;
    if (updateDoctorDto.lastName) doctorUser.lastName = updateDoctorDto.lastName;
    if (updateDoctorDto.phone) doctorUser.phone = updateDoctorDto.phone;

    await doctorUser.save();

    if (updateDoctorDto.departmentId) {
      const department = await this.departmentModel.findById(
        updateDoctorDto.departmentId,
      );
      if (!department) {
        throw new BadRequestException('Department not found');
      }
      doctor.departmentId = department._id;
    }

    if (updateDoctorDto.specialization) doctor.specialization = updateDoctorDto.specialization;
    if (updateDoctorDto.qualification) doctor.qualification = updateDoctorDto.qualification;
    if (updateDoctorDto.experience !== undefined) doctor.experience = updateDoctorDto.experience;
    if (updateDoctorDto.consultationFee !== undefined) doctor.consultationFee = updateDoctorDto.consultationFee;
    if (updateDoctorDto.bio !== undefined) doctor.bio = updateDoctorDto.bio;
    if (updateDoctorDto.availableDays) doctor.availableDays = updateDoctorDto.availableDays;

    if (updateDoctorDto.startTime || updateDoctorDto.endTime) {
      doctor.availableTime = {
        startTime: updateDoctorDto.startTime ?? doctor.availableTime?.startTime,
        endTime: updateDoctorDto.endTime ?? doctor.availableTime?.endTime,
      };
    }

    doctor.updatedBy = new Types.ObjectId(user.id);
    await doctor.save();

    const updatedDoctor = await this.doctorModel
      .findById(doctor._id)
      .populate('user', 'firstName lastName email phone')
      .populate('departmentId', 'name description')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    return {
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor,
    };
  }

  // Soft Delete Doctor
  async deleteDoctor(id: string, user: CurrentUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Doctor ID');
    }

    const doctor = await this.doctorModel.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isActive) {
      throw new BadRequestException('Doctor already deleted');
    }

    const doctorUser = await this.userModel.findById(doctor.user);
    if (!doctorUser) {
      throw new NotFoundException('Associated User not found');
    }

    doctor.isActive = false;
    doctor.updatedBy = new Types.ObjectId(user.id);
    doctorUser.isActive = false;

    await doctor.save();
    await doctorUser.save();

    return {
      success: true,
      message: 'Doctor deleted successfully',
    };
  }

  // Restore Doctor
  async restoreDoctor(id: string, user: CurrentUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Doctor ID');
    }

    const doctor = await this.doctorModel.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.isActive) {
      throw new BadRequestException('Doctor is already active');
    }

    const doctorUser = await this.userModel.findById(doctor.user);
    if (!doctorUser) {
      throw new NotFoundException('Associated User not found');
    }

    doctor.isActive = true;
    doctor.updatedBy = new Types.ObjectId(user.id);
    doctorUser.isActive = true;

    await doctor.save();
    await doctorUser.save();

    return {
      success: true,
      message: 'Doctor restored successfully',
    };
  }
}