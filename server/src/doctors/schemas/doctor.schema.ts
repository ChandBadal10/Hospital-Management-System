import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Department } from "src/departments/schemas/department.schema";
import { User } from "src/users/schemas/user.schema";



export type DoctorDocument = HydratedDocument<Doctor>;

@Schema({
    timestamps: true
})


export class Doctor {
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
        unique: true
    })
    user!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Department.name,
        required: true
    })
    departmentId!: Types.ObjectId;

    @Prop({
        required: true,
        trim: true
    })
    specialization!: string;

    @Prop({
        required: true,
        trim: true
    })
    qualification!: string;

    @Prop({
        required: true,
        min: 0
    })
    experience!: number;

    @Prop({
    required: true,
    min: 0,
  })
  consultationFee!: number;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  licenseNumber!: string;

  @Prop({
    default: "",
  })
  bio!: string;

  @Prop({
    default: "",
  })
  profileImage!: string;

  @Prop({
    type: [String],
    default: [],
  })
  availableDays!: string[];

  @Prop({
    type: {
      startTime: String,
      endTime: String,
    },
  })
  availableTime!: {
    startTime: string;
    endTime: string;
  };


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

export const DoctorSchema = SchemaFactory.createForClass(Doctor);