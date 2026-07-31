import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patient!: string;

  @IsString()
  @IsNotEmpty()
  doctor!: string;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsDateString()
  appointmentDate!: Date;

  @IsString()
  @IsNotEmpty()
  appointmentTime!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}