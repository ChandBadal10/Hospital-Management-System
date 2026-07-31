import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Department } from "src/departments/schemas/department.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { Patient } from "src/patients/schemas/patient.schema";
import { AppointmentStatus } from "../enums/appointment-status.enum";
import { PaymentStatus } from "../enums/payment-status.enum";
import { User } from "src/users/schemas/user.schema";



export type AppointmentDocument = HydratedDocument<Appoinment>;


@Schema({
    timestamps: true
})


export class Appoinment{
    @Prop({
        type: Types.ObjectId,
        ref: Patient.name,
        required: true
    })
    patient!: Types.ObjectId;


    @Prop({
        type: Types.ObjectId,
        ref: Doctor.name,
        required: true
    })
    doctor!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Department.name,
        required: true
    })
    department!: Types.ObjectId;

    @Prop({
        required: true
    })
    appointmentDate!: Date;

    @Prop({
        required: true,
        trim: true
    })
    appointmentTime!: string;

    @Prop({
        required: true,
        trim: true,
    })
    reason!: string;

    @Prop({
        required: true,
        default: []
    })
    symptoms!: string[];

    @Prop({
        default: "",
    })
    notes! : string;

    @Prop({
    required: true,
    min: 0,
    })
    consultationFee!: number;

    @Prop({
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    })
    status!: AppointmentStatus;

    @Prop({
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    })
    paymentStatus!: PaymentStatus;

    @Prop({
    default: true,
    })
    isActive!: boolean;

    @Prop({
    type: Types.ObjectId,
    ref: User.name,
    })
    createdBy!: Types.ObjectId;

    @Prop({
    type: Types.ObjectId,
    ref: User.name,
    })
    updatedBy!: Types.ObjectId;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appoinment);