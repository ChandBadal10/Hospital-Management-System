import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Role } from "../enums/role.enum";



export type UserDocument = HydratedDocument<User>;


@Schema({
    timestamps: true
})


export class User {
    @Prop({
        required: true,
        trim: true
    })
    firstName!: string;


    @Prop({
        required: true,
        trim: true
    })
    lastName!: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    email!: string;

    @Prop({
        required: true
    })
    password!: string;

    @Prop({
        required: true
    })
    phone!: string;

    @Prop({
        type: String,
        enum: Role,
        default: Role.PATIENT
    })
    role!: Role;

    @Prop({
        default: false
    })
    isVerified!: boolean;

    @Prop({
    type: String,
    default: null,
    select: false
    })
    refreshToken!: string | null;

    // Forgot Password OTP
    @Prop({
    type: String,
    default: null,
    select: false,
    })
    passwordResetOtp!: string | null;

    @Prop({
    type: Date,
    default: null,
    select: false,
    })
    passwordResetOtpExpires!: Date | null;

    @Prop({
        default: "",
    })
    profileImage!: string;

    @Prop({
        default: true
    })
    isActive!: boolean;
}


export const UserSchema = SchemaFactory.createForClass(User)