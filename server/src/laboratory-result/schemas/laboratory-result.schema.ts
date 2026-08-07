import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { LaboratoryOrder } from "src/laboratory-orders/schemas/laboratory-order.schema";
import { Laboratory } from "src/laboratories/schemas/laboratory.schema";
import { Patient } from "src/patients/schemas/patient.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { User } from "src/users/schemas/user.schema";

import { LaboratoryResultStatus } from "../enums/laboratory-result-status.enum";

export type LaboratoryResultDocument =
  HydratedDocument<LaboratoryResult>;

@Schema({
  timestamps: true,
})
export class LaboratoryResult {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: LaboratoryOrder.name,
    required: true,
  })
  laboratoryOrder!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Laboratory.name,
    required: true,
  })
  laboratory!: Types.ObjectId;

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
    required: true,
    type: [
      {
        testName: {
          type: String,
          required: true,
          trim: true,
        },
        result: {
          type: String,
          required: true,
          trim: true,
        },
        unit: {
          type: String,
          required: true,
          trim: true,
        },
        normalRange: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  })
  results!: {
    testName: string;
    result: string;
    unit: string;
    normalRange: string;
  }[];

  @Prop({
    default: "",
    trim: true,
  })
  remarks!: string;

  @Prop({
    enum: LaboratoryResultStatus,
    default: LaboratoryResultStatus.PENDING,
  })
  status!: LaboratoryResultStatus;

  @Prop({
    default: Date.now,
  })
  performedDate!: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  verifiedBy!: Types.ObjectId;

  @Prop({
    default: null,
  })
  verifiedDate!: Date;

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

export const LaboratoryResultSchema =
  SchemaFactory.createForClass(LaboratoryResult);