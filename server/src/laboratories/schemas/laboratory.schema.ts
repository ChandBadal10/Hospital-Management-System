import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/schemas/user.schema";

export type LaboratoryDocument = HydratedDocument<Laboratory>;

@Schema({
  timestamps: true,
})
export class Laboratory {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  name!: string;

  @Prop({
    default: "",
    trim: true,
  })
  description!: string;

  @Prop({
    required: true,
    trim: true,
  })
  location!: string;

  @Prop({
    required: true,
    trim: true,
  })
  contactNumber!: string;

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

export const LaboratorySchema =
  SchemaFactory.createForClass(Laboratory);