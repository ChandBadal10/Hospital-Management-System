import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/schemas/user.schema";



export type DepartmentDocument = HydratedDocument<Department>;


@Schema({
    timestamps: true
})


export class Department {
    @Prop({
        required: true,
        unique: true,
        trim: true
    })
    name!: string;

    @Prop({
        required: true,
        trim: true
    })
    description!: string;


    @Prop({
        default: ""
    })
    image!: string;

    @Prop({
        default: true
    })
    isActive!: boolean;

    @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    })
    createdBy?: Types.ObjectId;

    @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    })
    updatedBy?: Types.ObjectId;

}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
