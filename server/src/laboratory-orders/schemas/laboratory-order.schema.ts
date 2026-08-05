import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { Appointment } from "src/appointments/schemas/appointment.schema";
import { MedicalRecord } from "src/medical-records/schemas/medical-record.schema";
import { Patient } from "src/patients/schemas/patient.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { LaboratoryTest } from "src/laboratory-tests/schemas/laboratory-test.schema";
import { User } from "src/users/schemas/user.schema";

import { LaboratoryOrderStatus } from "../enums/laboratory-order-status.enum";

export type LaboratoryOrderDocument =
  HydratedDocument<LaboratoryOrder>;

@Schema({
  timestamps: true,
})
export class LaboratoryOrder {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Appointment.name,
    required: true,
  })
  appointment!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: MedicalRecord.name,
    required: true,
  })
  medicalRecord!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Patient.name,
    required: true,
  })
  patient!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Doctor.name,
    required: true,
  })
  doctor!: Types.ObjectId;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: LaboratoryTest.name,
      },
    ],
    required: true,
  })
  orderedTests!: Types.ObjectId[];

  @Prop({
    type: String,
    enum: LaboratoryOrderStatus,
    default: LaboratoryOrderStatus.PENDING,
  })
  status!: LaboratoryOrderStatus;

  @Prop({
    default: "",
    trim: true,
  })
  notes!: string;

  @Prop({
    default: Date.now,
  })
  orderedDate!: Date;

  @Prop()
  sampleCollectedDate?: Date;

  @Prop()
  completedDate?: Date;

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  updatedBy!: Types.ObjectId;
}

export const LaboratoryOrderSchema =
  SchemaFactory.createForClass(LaboratoryOrder);