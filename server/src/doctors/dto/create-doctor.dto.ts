import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDoctorDto {
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

  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @IsString()
  @IsNotEmpty()
  qualification!: string;

  @IsNumber()
  experience!: number;

  @IsNumber()
  consultationFee!: number;

  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @IsArray()
  availableDays!: string[];

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  @IsOptional()
  bio?: string;
}