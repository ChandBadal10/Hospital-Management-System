import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";



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
        type: Types.ObjectId,
        ref: "User",
    })
    createdBy!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "User",
    })
    updatedBy!: Types.ObjectId;

}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
