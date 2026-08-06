import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaboratoryOrderDto } from './dto/create-laboratory-order.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { LaboratoryOrder, LaboratoryOrderDocument } from './schemas/laboratory-order.schema';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/appointments/schemas/appointment.schema';
import { MedicalRecord, MedicalRecordDocument } from 'src/medical-records/schemas/medical-record.schema';
import { Patient, PatientDocument } from 'src/patients/schemas/patient.schema';
import { Doctor, DoctorDocument } from 'src/doctors/schemas/doctor.schema';
import { LaboratoryTest, LaboratoryTestDocument } from 'src/laboratory-tests/schemas/laboratory-test.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UpdateLaboratoryOrderDto } from './dto/update-laboratory-order.dto';

@Injectable()
export class LaboratoryOrdersService {
    constructor(
        @InjectModel(LaboratoryOrder.name)
        private laboratoryOrderModel: Model<LaboratoryOrderDocument>,

        @InjectModel(Appointment.name)
        private appointmentModel: Model<AppointmentDocument>,

        @InjectModel(MedicalRecord.name)
        private medicalRecordModel: Model<MedicalRecordDocument>,

        @InjectModel(Patient.name)
        private patientModel: Model<PatientDocument>,

        @InjectModel(Doctor.name)
        private doctorModel: Model<DoctorDocument>,

        @InjectModel(LaboratoryTest.name)
        private laboratoryTestModel: Model<LaboratoryTestDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) {}

    async createLaboratoryOrder(createLaboratoryOrderDto: CreateLaboratoryOrderDto, user: CurrentUser) {
        const {appointment, medicalRecord, patient, doctor, orderedTests} = createLaboratoryOrderDto;

        //Appointment Check
        const appointmentExists = await this.appointmentModel.findById(appointment);

        if(!appointmentExists) {
            throw new NotFoundException("Appointment not found")
        }

        //Medical Record Check
        const medicalRecordExists = await this.medicalRecordModel.findById(medicalRecord);

        if(!medicalRecordExists) {
            throw new NotFoundException("Medical Record not found")
        }

        //Patient Check
        const patientExists = await this.patientModel.findById(patient);

        if(!patientExists) {
            throw new NotFoundException("Patient not found");
        }


        //Doctor Check
        const doctorExists = await this.doctorModel.findById(doctor);

        if(!doctorExists) {
            throw new NotFoundException("Doctor not found")
        }

        //Laboratory tests check
        const tests = await this.laboratoryTestModel.find({
            _id: {$in: orderedTests},
            isActive: true
        });

        if(tests.length !== orderedTests.length) {
            throw new BadRequestException("One or more laboratory tests are invalid")
        }

        const laboratoryOrder = await this.laboratoryOrderModel.create({
            ...createLaboratoryOrderDto,
            createdBy: new Types.ObjectId(user.id),
            updatedBy: new Types.ObjectId(user.id)
        });

        const data = await this.laboratoryOrderModel.findById(laboratoryOrder._id)
        .populate(
                "appointment",
                "appointmentDate appointmentTime status",
            )

            .populate({
                path: "patient",
                select: "patientId",
                populate: {
                    path: "user",
                    select: "firstName lastName",
                },
            })

            .populate({
                path: "doctor",
                select: "specialization",
                populate: {
                    path: "user",
                    select: "firstName lastName",
                },
            })

            .populate(
                "medicalRecord",
                "diagnosis treatment",
            )

            .populate(
                "orderedTests",
                "name category price sampleType",
            )

            .populate(
                "createdBy",
                "firstName lastName",
            )

            .populate(
                "updatedBy",
                "firstName lastName",
            );

            return {
                success: true,
                message: "Laboratory order created successfully",
                data
            }
    }

    //Get All
    async getAllLaboratoryOrder() {
        const laboratoryOrder = await this.laboratoryOrderModel.find({isActive: true})
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")

        if(!laboratoryOrder) {
            throw new NotFoundException("Laboratory Order Not found");
        }

        return {
            success: true,
            message: "Laboratory Order Successfully Fectched",
            data: laboratoryOrder
        }
    }

    // Get By Id
    async getLaboratoryOrderById(id: string) {
        const laboratoryOrder = await this.laboratoryOrderModel.findOne({_id: id, isActive: true})
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")

        if(!laboratoryOrder) {
            throw new NotFoundException("Laboratory Order not found");
        }

        return {
            success: true,
            message: "Laboratory Order By Id fetched successfully",
            data: laboratoryOrder
        }

    }

    //Update
    async updateLaboratoryOrder(id: string, updateLaboratoryOrderDto: UpdateLaboratoryOrderDto, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new NotFoundException("Invalid Id")
        }

        const laboratoryOrder = await this.laboratoryOrderModel.findById(id);

        if(!laboratoryOrder || !laboratoryOrder.isActive) {
            throw new BadRequestException("Laboratory Order Not Found");
        }

        const updateLaboratoryOrderRecord = await this.laboratoryOrderModel.findByIdAndUpdate(id, {
            ...updateLaboratoryOrderDto,
            updatedBy: new Types.ObjectId(user.id)
        })

        return {
            success: true,
            message: "Successfully Updated the Laboratory Order",
            data: updateLaboratoryOrderRecord
        }
    }



    //Soft Delete
    async deleteLaboratoryOrder(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)){
            throw new BadRequestException("Invalid Laboratory Order ID");
        }

        const laboratoryOrder = await this.laboratoryOrderModel.findById(id);
        if(!laboratoryOrder) {
            throw new BadRequestException("Laboratory Order Not Found");
        }

        if(!laboratoryOrder.isActive) {
            throw new BadRequestException("Laboratory Order is Already Deleted")
        }

        laboratoryOrder.isActive = false;
        laboratoryOrder.updatedBy = new Types.ObjectId(user.id)

        await laboratoryOrder.save();

        return {
            success: true,
            message: "Laboratory Order Deleted Successfully"
        }
    }

    //Restore Laboratory
    async restoreLaboratoryOrder(id: string, user: CurrentUser) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Laboratory Order Id");
        }

        const laboratoryOrder = await this.laboratoryOrderModel.findById(id);

        if(!laboratoryOrder) {
            throw new BadRequestException("Laboratory Order Not Found")
        }

        if(laboratoryOrder.isActive) {
            throw new BadRequestException("Laboratory Order is Already Active")
        }

        laboratoryOrder.isActive = true,
        laboratoryOrder.updatedBy = new Types.ObjectId(user.id)

        await laboratoryOrder.save()


        return {
            success: true,
            message: "Laboratory Order Successfully Restored"
        }
    }

}
