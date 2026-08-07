import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { LaboratoryResultStatus } from "../enums/laboratory-result-status.enum";

class ResultDto {
  @IsString()
  @IsNotEmpty()
  testName!: string;

  @IsString()
  @IsNotEmpty()
  result!: string;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsString()
  @IsNotEmpty()
  normalRange!: string;
}

export class CreateLaboratoryResultDto {
  @IsMongoId()
  @IsNotEmpty()
  laboratoryOrder!: string;

  @IsMongoId()
  @IsNotEmpty()
  laboratory!: string;

  @IsMongoId()
  @IsNotEmpty()
  patient!: string;

  @IsMongoId()
  @IsNotEmpty()
  doctor!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ResultDto)
  results!: ResultDto[];

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(LaboratoryResultStatus)
  status?: LaboratoryResultStatus;
}