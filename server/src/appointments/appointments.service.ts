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
}
