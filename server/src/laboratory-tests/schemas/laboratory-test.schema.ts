import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Laboratory } from "src/laboratories/schemas/laboratory.schema";
import { User } from "src/users/schemas/user.schema";
import { LaboratoryTestCategory } from "../enums/laboratory-test-category.enum";

export type LaboratoryTestDocument =
  HydratedDocument<LaboratoryTest>;

@Schema({
  timestamps: true,
})
export class LaboratoryTest {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Laboratory.name,
    required: true,
  })
  laboratory!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    enum: LaboratoryTestCategory,
    required: true,
  })
  category!: LaboratoryTestCategory;

  @Prop({
    default: "",
  })
  description!: string;

  @Prop({
    required: true,
  })
  price!: number;

  @Prop({
    default: "",
  })
  normalRange!: string;

  @Prop({
    default: "",
  })
  sampleType!: string;

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

export const LaboratoryTestSchema =
  SchemaFactory.createForClass(LaboratoryTest);