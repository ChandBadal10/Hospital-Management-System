import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prescription, PrescriptionDocument } from './schemas/prescription.schema';
import { Model, Types } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from 'src/medical-records/schemas/medical-record.schema';
import { Patient, PatientDocument } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorDocument } from 'src/doctors/schemas/doctor.schema';
import { Appointment, AppointmentDocument } from 'src/appointments/schemas/appointment.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

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


    //Get All Prescription
    async getAllPrescriptions() {
        const prescriptions = await this.prescriptionModel.find({ isActive: true })
         .populate({
            path: "medicalRecord",
            })

            .populate({
            path: "appointment",
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
            })

            .sort({ createdAt: -1 });

            return {
                success: true,
                message: "Prescription fetched successfully",
                data: prescriptions
            }
    }

    //Get Prescription By Id
    async getPrescriptionById(id: string) {
        //Validate MongoDB ID
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Prescription ID");
        }

        //Find Prescription
        const prescription = await this.prescriptionModel.findOne({_id: id, isActive: true})
         .populate({
            path: "medicalRecord",
        })

        .populate({
            path: "appointment",
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

        if(!prescription) {
            throw new BadRequestException("Prescription not found");
        }

        return {
            success: true,
            message: "Prescription fetched successfully",
            data: prescription
        }
    }

    //Update Prescription
    async updatePrescription(id: string, updatePrescriptionDto: UpdatePrescriptionDto, user: CurrentUser) {
        //Validate id
        if(!Types.ObjectId.isValid(id)){
            throw new BadRequestException("Invalid Prescription ID");
        }

        //Find Prescription
        const prescription = await this.prescriptionModel.findOne({_id: id, isActive: true});

        if(!prescription) {
            throw new BadRequestException("Prescription not found")
        }

        // If Medical Record is Changing
        if(updatePrescriptionDto.medicalRecord) {
            if(!Types.ObjectId.isValid(updatePrescriptionDto.medicalRecord)) {
                throw new BadRequestException("Invalid Medical Record Id");
            }

            const medicalRecord = await this.medicalRecordModel.findById(updatePrescriptionDto.medicalRecord);

            if(!medicalRecord) {
                throw new BadRequestException("Medical Record not found");
            }
        }

        //If Patient is Changing
        if(updatePrescriptionDto.patient) {
            if(!Types.ObjectId.isValid(updatePrescriptionDto.patient)) {
                throw new BadRequestException("Invalid Patient ID");
            }

            const patient = await this.patientModel.findById(updatePrescriptionDto.patient);

            if(!patient) {
                throw new BadRequestException("Patient not found");
            }
        }

        //If Doctor is changing

        if(updatePrescriptionDto.doctor) {
            if(!Types.ObjectId.isValid(updatePrescriptionDto.doctor)) {
                throw new BadRequestException("Invalid Doctor ID");
            }

            const doctor = await this.doctorModel.findById(updatePrescriptionDto.doctor);

            if(!doctor) {
                throw new BadRequestException("Doctor not found")
            }
        }

        //Update
        const updatePrescription = await this.prescriptionModel.findByIdAndUpdate(id, {
            ...updatePrescriptionDto,
            updatedBy: new Types.ObjectId(user.id)
        }, {
            new: true
        })
            .populate("medicalRecord")
            .populate("appointment")
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
            .populate("createdBy", "firstName lastName")
            .populate("updatedBy", "firstName lastName");

            return {
                success: true,
                message: "Prescription updated successfully",
                data: updatePrescription
            }
    }

    //Soft Delete
    async deletePrescription(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Prescription ID")
        }

        const prescription = await this.prescriptionModel.findById(id);
        if(!prescription) {
            throw new BadRequestException("Prescription not found")
        }

        if(!prescription.isActive) {
            throw new BadRequestException("Prescription already deleted")
        }

        prescription.isActive = false;
        prescription.updatedBy = new Types.ObjectId(user.id);
        await prescription.save();

        return {
            success: true,
            message: "Prescription deleted successfully"
        }
    }


    //Restore Prescription
    async restorePrescription(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Prescription ID")
        }

        const prescription = await this.prescriptionModel.findById(id);

        if(!prescription) {
            throw new BadRequestException("Prescription not found");
        }

        if(prescription.isActive) {
            throw new BadRequestException("Prescription is already Active")
        }

        prescription.isActive = true;
        prescription.updatedBy = new Types.ObjectId(user.id);
        await prescription.save();

        return {
            success: true,
            message: "Restore Successfully"
        }
    }
}
