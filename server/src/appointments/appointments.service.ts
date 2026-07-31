import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appoinment, AppointmentDocument } from './schemas/appointment.schema';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from 'src/departments/schemas/department.schema';
import { Doctor, DoctorDocument } from 'src/doctors/schemas/doctor.schema';
import { Patient, PatientDocument } from 'src/patients/schemas/patient.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { GetAllAppointmentsDto } from './dto/get-all-appointments.dto';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appoinment.name)
        private readonly appointmentModel: Model<AppointmentDocument>,

        @InjectModel(Department.name)
        private readonly departmentModel: Model<DepartmentDocument>,

        @InjectModel(Doctor.name)
        private readonly doctorModel: Model<DoctorDocument>,

        @InjectModel(Patient.name)
        private readonly  patientModel : Model<PatientDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>

    ) {}

    async createAppointment(createAppointmentDto: CreateAppointmentDto, user: CurrentUser) {
        if(!Types.ObjectId.isValid(createAppointmentDto.patient)) {
            throw new BadRequestException("Invalid Patient ID");
        }

        if(!Types.ObjectId.isValid(createAppointmentDto.doctor)) {
            throw new BadRequestException("Invalid Doctor ID");
        }

        if(!Types.ObjectId.isValid(createAppointmentDto.department)) {
            throw new BadRequestException("Invalid Department ID");
        }


        const patient = await this.patientModel.findById(createAppointmentDto.patient);

        if(!patient) {
            throw new BadRequestException("Patient not found");
        }

        if(!patient.isActive) {
            throw new BadRequestException("Patient is inActive");
        }

        const doctor = await this.doctorModel.findById(createAppointmentDto.doctor);
        if(!doctor) {
            throw new BadRequestException("Doctor not found");
        }


        if(!doctor.isActive) {
            throw new BadRequestException("Doctor is inActive");
        }

        const department = await this.departmentModel.findById(createAppointmentDto.department);

        if(!department) {
            throw new BadRequestException("Department not found")
        }

        if(!department.isActive){
            throw new BadRequestException("Department is inActive");
        }



        //verify doctor belongs to the department or not
        if(doctor.departmentId.toString() !== department._id.toString()) {
            throw new BadRequestException("Doctor does not belong to this department")
        }


        //Check for duplicate Appointment

        const existingAppointment = await this.appointmentModel.findOne({
            doctor: doctor._id,
            appointmentDate: createAppointmentDto.appointmentDate,
            appointmentTime: createAppointmentDto.appointmentTime,
            status: {
                $in: [
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    ],
            }
        });

        if(existingAppointment) {
            throw new BadRequestException("Doctor already has an appointment at this time")
        }


        //create the appointment
        const appointment = await this.appointmentModel.create({
            patient: patient._id,
            doctor: doctor._id,
            department: department._id,


            appointmentDate: createAppointmentDto.appointmentDate,
            appointmentTime: createAppointmentDto.appointmentTime,


            reason: createAppointmentDto.reason,
            symptoms: createAppointmentDto.symptoms,

            consultationFee: doctor.consultationFee,

            status: AppointmentStatus.PENDING,

            createdBy: user.id,
            updatedBy: user.id,
        });


        await appointment.populate([
        {
        path: "patient",
        populate: {
        path: "user",
        select: "firstName lastName email phone",
        },
        },
        {
        path: "doctor",
        populate: {
        path: "user",
        select: "firstName lastName email phone",
        },
        },
        {
        path: "department",
        select: "name description",
        },
    ]);

    return {
    success: true,
    message: "Appointment created successfully",
    data: appointment,
    };

    }


    //Get All Appointments
    async getAllAppointments(query: GetAllAppointmentsDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const skip = (page - 1 ) * limit;


        const filter: any = {
            isActive: true,
        };

        if (query.doctor) {
        filter.doctor = query.doctor;
        }

        if (query.patient) {
        filter.patient = query.patient;
        }

        if (query.department) {
        filter.department = query.department;
        }

        if (query.status) {
        filter.status = query.status;
        }

        if (query.paymentStatus) {
        filter.paymentStatus = query.paymentStatus;
        }

        if (query.appointmentDate) {
        const startDate = new Date(query.appointmentDate);
        const endDate = new Date(query.appointmentDate);

        endDate.setHours(23, 59, 59, 999);

        filter.appointmentDate = {
            $gte: startDate,
            $lte: endDate,
        };
        }

        const total = await this.appointmentModel.countDocuments(filter);

        const appointments = await this.appointmentModel
        .find(filter)
        .populate({
            path: "patient",
            populate: {
            path: "user",
            select: "firstName lastName email phone",
            },
        })
        .populate({
            path: "doctor",
            populate: {
            path: "user",
            select: "firstName lastName email phone",
            },
        })
        .populate("department", "name description")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        return {
            success: true,
            message: "Appointments fetched successfully",
            data: appointments,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
    }


    //Get appointment by id
    async getAppointmentById(id: string) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Appointment ID")
        }

        const appointment = await this.appointmentModel
        .findById(id)
        .populate({
            path: "patient",
            populate: {
            path: "user",
            select: "firstName lastName email phone",
            },
        })
        .populate({
            path: "doctor",
            populate: {
            path: "user",
            select: "firstName lastName email phone",
            },
        })
        .populate("department", "name description")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");


        if (!appointment) {
        throw new BadRequestException("Appointment not found");
        }

        return {
        success: true,
        message: "Appointment fetched successfully",
        data: appointment,
        };
    }







    //update appointment
    async updateAppointment(id: string, updateAppointmentDto, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Appointment ID")
        }

        const appointment = await this.appointmentModel.findById(id);

        if(!appointment) {
            throw new BadRequestException("Appointment not found")
        }

        if(!appointment.isActive) {
            throw new BadRequestException("Appointment is inActive")
        }

        if(updateAppointmentDto.doctor) {
            const doctor = await this.doctorModel.findById(updateAppointmentDto.doctor);

            if(!doctor) {
                throw new BadRequestException("Doctor not found")
            }

        }

        if(updateAppointmentDto.department) {
            const department = await this.departmentModel.findById(updateAppointmentDto.department);

            if(!department) {
                throw new BadRequestException("Department not found")
            }

        }

        const doctorId = updateAppointmentDto.doctor ?? appointment.doctor.toString();

        const departmentId =
        updateAppointmentDto.department ?? appointment.department.toString();

        const appointmentDate =
        updateAppointmentDto.appointmentDate ?? appointment.appointmentDate;

        const appointmentTime =
        updateAppointmentDto.appointmentTime ?? appointment.appointmentTime;


        const doctor = await this.doctorModel.findById(doctorId);

        if (!doctor) {
        throw new BadRequestException("Doctor not found");
        }


        if (doctor.departmentId.toString() !== departmentId) {
        throw new BadRequestException(
            "Selected doctor does not belong to this department",
            );
        }


        const existingAppointment = await this.appointmentModel.findOne({
        _id: { $ne: appointment._id },
        doctor: doctorId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        status: {
            $in: [
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            ],
            },
        });

        if (existingAppointment) {
        throw new BadRequestException(
        "Doctor already has an appointment at this time",
        );
        }

        appointment.doctor = doctor._id;
        appointment.department = departmentId as any;

        appointment.appointmentDate = appointmentDate;
        appointment.appointmentTime = appointmentTime;

        appointment.reason =
        updateAppointmentDto.reason ?? appointment.reason;

        appointment.symptoms =
        updateAppointmentDto.symptoms ?? appointment.symptoms;

        appointment.notes =
        updateAppointmentDto.notes ?? appointment.notes;

        appointment.consultationFee = doctor.consultationFee;
        appointment.updatedBy = new Types.ObjectId(user.id);
        await appointment.save();


        const updatedAppointment = await this.appointmentModel
        .findById(appointment._id)
        .populate({
            path: "patient",
            populate: {
            path: "user",
            select: "firstName lastName email phone",
            },
        })
        .populate({
            path: "doctor",
            populate: {
            path: "user",
            select: "firstName lastName email phone",
            },
        })
        .populate("department", "name description")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");


        return {
        success: true,
        message: "Appointment updated successfully",
        data: updatedAppointment,
        };
    }


    //Delete Appointment
    async deleteAppointment(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Appointment ID")
        }

        const appointment = await this.appointmentModel.findById(id);

        if(!appointment) {
            throw new BadRequestException("Appointment is not found")
        }

        if(!appointment.isActive) {
            throw new BadRequestException("Appointment is already deleted")
        }

        appointment.isActive = false;
        appointment.updatedBy = new Types.ObjectId(user.id);


        await appointment.save();


        return {
            success: true,
            message: "Appointment deleted successfully"
        }
    }


    //Restore Appointment
    async restoreAppointment(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Appointment ID")
        }

        const appointment = await this.appointmentModel.findById(id);

        if(!appointment) {
            throw new BadRequestException("Appointment is not found")
        }

        if(appointment.isActive) {
            throw new BadRequestException("Appointment is active")
        }

        appointment.isActive = true;
        appointment.updatedBy = new Types.ObjectId(user.id);

        await appointment.save()

        return {
            success: true,
            message: "Appointment successfully Restored"
        }
    }


}
