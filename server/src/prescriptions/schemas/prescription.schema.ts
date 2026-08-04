import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { MedicalRecord } from "src/medical-records/schemas/medical-record.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { Patient } from "src/patients/schemas/patient.schema";
import { User } from "src/users/schemas/user.schema";

export type PrescriptionDocument = HydratedDocument<Prescription>;

@Schema({
  timestamps: true,
})
export class Prescription {

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
    required: true,
  })
  medicines!: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
  }[];

  @Prop({
    default: "",
  })
  notes!: string;

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  createdBy!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  updatedBy!: Types.ObjectId;
}

export const PrescriptionSchema =
SchemaFactory.createForClass(Prescription);