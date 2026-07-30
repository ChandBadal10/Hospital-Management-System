import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/schemas/user.schema";

export type PatientDocument = HydratedDocument<Patient>;

@Schema({
  timestamps: true,
})
export class Patient {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
  })
  user!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  patientId!: string;

  @Prop({
    required: true,
  })
  dateOfBirth!: Date;

  @Prop({
    required: true,
  })
  gender!: string;

  @Prop()
  bloodGroup!: string;

  @Prop()
  height!: number;

  @Prop()
  weight!: number;

  @Prop()
  emergencyContactName!: string;

  @Prop()
  emergencyContactNumber!: string;

  @Prop()
  address!: string;

  @Prop()
  city!: string;

  @Prop()
  state!: string;

  @Prop()
  country!: string;

  @Prop({
    default: "",
  })
  profileImage!: string;

  @Prop({
    type: [String],
    default: [],
  })
  allergies!: string[];

  @Prop({
    type: [String],
    default: [],
  })
  medicalHistory!: string[];

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

export const PatientSchema = SchemaFactory.createForClass(Patient);