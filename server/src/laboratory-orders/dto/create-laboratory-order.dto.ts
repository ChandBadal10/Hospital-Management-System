import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateLaboratoryOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  appointment!: string;

  @IsMongoId()
  @IsNotEmpty()
  medicalRecord!: string;

  @IsMongoId()
  @IsNotEmpty()
  patient!: string;

  @IsMongoId()
  @IsNotEmpty()
  doctor!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  orderedTests!: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}