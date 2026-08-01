import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type MedicalRecordDocument = HydratedDocument<MedicalRecord>;

@Schema({
  timestamps: true,
})
export class MedicalRecord {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  })
  appointment!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  })
  patient!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  })
  doctor!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  diagnosis!: string;

  @Prop({
    required: true,
    trim: true,
  })
  treatment!: string;

  @Prop({
    trim: true,
    default: "",
  })
  prescription!: string;

  @Prop({
    trim: true,
    default: "",
  })
  doctorNotes!: string;

  @Prop()
  followUpDate?: Date;

  @Prop({
    type: {
      bloodPressure: {
        type: String,
        default: "",
      },
      heartRate: {
        type: Number,
        default: 0,
      },
      temperature: {
        type: Number,
        default: 0,
      },
      oxygenLevel: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
      weight: {
        type: Number,
        default: 0,
      },
    },
    default: {},
  })
  vitalSigns!: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenLevel: number;
    height: number;
    weight: number;
  };

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdBy!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  updatedBy!: Types.ObjectId;
}

export const MedicalRecordSchema =
  SchemaFactory.createForClass(MedicalRecord);