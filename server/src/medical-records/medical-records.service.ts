import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordDocument } from './schemas/medical-record.schema';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/appointments/schemas/appointment.schema';
import { Patient, PatientDocument } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorDocument } from 'src/doctors/schemas/doctor.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
    constructor(
        @InjectModel(MedicalRecord.name)
        private medicalRecordModel: Model<MedicalRecordDocument>,

        @InjectModel(Appointment.name)
        private appointmentModel: Model<AppointmentDocument>,

        @InjectModel(Patient.name)
        private patientModel: Model<PatientDocument>,

        @InjectModel(Doctor.name)
        private doctorModel: Model<DoctorDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) {}

    async createMedicalRecord(createMedicalRecordDto: CreateMedicalRecordDto, user: CurrentUser) {
        const {appointment, patient, doctor} = createMedicalRecordDto;

        //validate appointment id
        if(!Types.ObjectId.isValid(appointment)) {
            throw new BadRequestException("Invalid Appointment ID");
        }

        //Validate Patient Id
        if(!Types.ObjectId.isValid(patient)) {
            throw new BadRequestException("Invalid Patient ID")
        }

        //Validate Doctor id
        if(!Types.ObjectId.isValid(doctor)) {
            throw new BadRequestException("Invalid Doctor ID");
        }


        //find Appointment
        const appointmentData  = await this.appointmentModel.findById(appointment);

        if(!appointmentData) {
            throw new BadRequestException("Appointment not found");
        }



        //find Patient
        const patientData = await this.patientModel.findById(patient);

        if(!patientData) {
            throw new BadRequestException("Patient not found")
        }

        //find Doctor
        const doctorData = await this.doctorModel.findById(doctor);

        if(!doctorData) {
            throw new BadRequestException("Doctor not found");
        }

        //verify appointment belongs to patient
        if(appointmentData.patient.toString() !== patient) {
            throw new BadRequestException("Patient does not belong to this appointment");
        }

        //verify appointment belongs to doctor
        if(appointmentData.doctor.toString() !== doctor) {
            throw new BadRequestException("Doctor does not belong to this appointment")
        }


        //prevent duplicate record
        const existingMedicalRecord = await this.medicalRecordModel.findOne({appointment});

        if(existingMedicalRecord) {
            throw new BadRequestException("Medical record already exists for this appointment");
        }

        //create Record
       const medicalRecord = await this.medicalRecordModel.create({
        appointment: new Types.ObjectId(createMedicalRecordDto.appointment),
        patient: new Types.ObjectId(createMedicalRecordDto.patient),
        doctor: new Types.ObjectId(createMedicalRecordDto.doctor),

        diagnosis: createMedicalRecordDto.diagnosis,
        treatment: createMedicalRecordDto.treatment,
        prescription: createMedicalRecordDto.prescription,
        doctorNotes: createMedicalRecordDto.doctorNotes,
        followUpDate: createMedicalRecordDto.followUpDate,
        vitalSigns: createMedicalRecordDto.vitalSigns,

        createdBy: new Types.ObjectId(user.id),
        updatedBy: new Types.ObjectId(user.id),
        });

        const populatedMedicalRecord =
            await this.medicalRecordModel
                .findById(medicalRecord._id)

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

                return {
    success: true,
    message: "Medical record created successfully",
    data: populatedMedicalRecord,
};

    }


    //get all records
    async getAllMedicalRecords() {
        const medicalRecords = await this.medicalRecordModel.find({ isActive: true })
        .populate({
            path: "appointment"
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
    message: "Medical records fetched successfully",
    data: medicalRecords,
  };



}


    //Get medical record by id

    async getMedicalRecordById(id: string) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Medical Record ID");
        }

        const medicalRecord = await this.medicalRecordModel.findById(id)
        .populate({
            path: "appointment"
        })

        .populate({
            path: "patient",
            populate: {
                path: "user",
                select: "firstName lastName email phone"
            },
        })

        .populate({
            path: "doctor",
            populate: {
                path: "user",
                select: "firstName lastName email phone"
            }
        })

        .populate({
            path: "createdBy",
            select: "firstName lastName"
        })

        .populate({
            path: "updatedBy",
            select:"firstName lastName"
        });

        if(!medicalRecord || !medicalRecord.isActive) {
            throw new BadRequestException("Medical record not found")
        }

        return {
            success: true,
            message: `Medical record fetched successfully for the id: ${id} `,
            data: medicalRecord
        }
    }


    //Update the Medical Record
    async updateMedicalRecord(
        id: string,
        updateMedicalRecordDto: UpdateMedicalRecordDto,
        user: CurrentUser
    ) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Medical record ID")
        }

        const medicalRecord = await this.medicalRecordModel.findById(id);

        if(!medicalRecord || !medicalRecord.isActive) {
            throw new BadRequestException("Medical record not found")
        }

        const updateMedicalRecord = await this.medicalRecordModel.findByIdAndUpdate(id, {
            ...updateMedicalRecordDto,
            updatedBy: new Types.ObjectId(user.id),
        }, {
            returnDocument: "after"
        },
        )
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

        return {
            success: true,
            message: "Medical record updated successfully",
            data: updateMedicalRecord,
        };
        }

        //Soft delete



}


