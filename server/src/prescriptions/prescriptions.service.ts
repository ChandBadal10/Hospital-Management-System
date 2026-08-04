import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prescription, PrescriptionDocument } from './schemas/prescription.schema';
import { Model, Types } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from 'src/medical-records/schemas/medical-record.schema';
import { Patient, PatientDocument } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorDocument } from 'src/doctors/schemas/doctor.schema';
import { Appointment, AppointmentDocument } from 'src/appointments/schemas/appointment.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateAppointmentDto } from 'src/appointments/dto/create-appointment.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
    constructor(
        @InjectModel(Prescription.name)
        private prescriptionModel: Model<PrescriptionDocument>,

        @InjectModel(MedicalRecord.name)
        private medicalRecordModel: Model<MedicalRecordDocument>,

        @InjectModel(Patient.name)
        private patientModel: Model<PatientDocument>,

        @InjectModel(Doctor.name)
        private doctorModel: Model<DoctorDocument>,

        @InjectModel(Appointment.name)
        private appointmentModel: Model<AppointmentDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>
    ) {}

    async createPrescription(createPrescriptionDto: CreatePrescriptionDto, user: CurrentUser) {
        const {appointment, medicalRecord, patient, doctor} = createPrescriptionDto;

        //Appointment
        if(!Types.ObjectId.isValid(appointment)) {
            throw new BadRequestException("Invalid Appointment ID");
        }

        //Medical Record
        if(!Types.ObjectId.isValid(medicalRecord)) {
            throw new BadRequestException("Invalid Medical Record ID")
        }

        //Patient
        if(!Types.ObjectId.isValid(patient)) {
            throw new BadRequestException("Invalid Patient ID")
        }

        //Doctor
        if(!Types.ObjectId.isValid(doctor)) {
            throw new BadRequestException("Invalid Doctor ID");
        }

        //Find Appointment
        const appointmentData = await this.appointmentModel.findById(appointment);
        if(!appointmentData) {
            throw new BadRequestException("Appointment not found");
        }

        //Find Medical Record
        const medicalRecordData = await this.medicalRecordModel.findById(medicalRecord);
        if(!medicalRecordData) {
            throw new BadRequestException("Medical Record not found");
        }

        //Find Patient
        const patientData = await this.patientModel.findById(patient);
        if(!patientData) {
            throw new BadRequestException("Patient not found")
        }

        //Find Doctor
        const doctorData = await this.doctorModel.findById(doctor);
        if(!doctorData) {
            throw new BadRequestException("Doctor not found");
        }

        //Verify Appointment belongs to Patient
        if(appointmentData.patient.toString() !== patient) {
            throw new BadRequestException("Patient does not belong to this appointment")
        }

        //Verify Appointment Belongs to Doctor
        if(appointmentData.doctor.toString() !== doctor) {
            throw new BadRequestException("Doctor not belong to this appointment")
        }

        //Verify medical records belongs to Appointment
        if(medicalRecordData.appointment.toString() !== appointment) {
            throw new BadRequestException("Medical Record does not belong to this appointment");
        }

        //Verify medical record belongs to patient
        if(medicalRecordData.patient.toString() !== patient) {
            throw new BadRequestException("Medical Record does not belong to this patient")
        }

        //Verify medical record belongs to doctor
        if(medicalRecordData.doctor.toString() !== doctor) {
            throw new BadRequestException("Medical Record does not belong to this doctor")
        }

        //Prevent Duplicate Prescription
        const existingPrescription = await this.prescriptionModel.findOne({medicalRecord});

        if(existingPrescription) {
            throw new BadRequestException("Prescription already exists for this medical record")
        }

        //Create Prescription
        const prescription = await this.prescriptionModel.create({
            ...createPrescriptionDto,
            createdBy: new Types.ObjectId(user.id),
            updatedBy: new Types.ObjectId(user.id)
        });


        const populatedPrescription = await this.prescriptionModel
            .findById(prescription._id)

            .populate({
                path: "appointment",
            })

            .populate({
                path: "medicalRecord",
            })

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

            .populate({
                path: "createdBy",
                select: "firstName lastName",
            })

            .populate({
                path: "updatedBy",
                select: "firstName lastName",
            });

            return {
                success: true,
                message: "Prescription created successfully",
                data: populatedPrescription
            }


    }
}
