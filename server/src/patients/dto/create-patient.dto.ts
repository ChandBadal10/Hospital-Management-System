import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsDateString()
  dateOfBirth!: Date;

  @IsString()
  gender!: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsString()
  emergencyContactName!: string;

  @IsString()
  emergencyContactNumber!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsArray()
  allergies?: string[];

  @IsOptional()
  @IsArray()
  medicalHistory?: string[];
}