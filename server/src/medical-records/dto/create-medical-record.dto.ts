import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class VitalSignsDto {
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @IsOptional()
  @IsNumber()
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  oxygenLevel?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class CreateMedicalRecordDto {
  @IsMongoId()
  @IsNotEmpty()
  appointment!: string;

  @IsMongoId()
  @IsNotEmpty()
  patient!: string;

  @IsMongoId()
  @IsNotEmpty()
  doctor!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  treatment!: string;

  @IsArray()
  @IsString({ each: true })
  prescription!: string[];

  @IsOptional()
  @IsString()
  doctorNotes?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;
}