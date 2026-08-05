import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from "class-validator";
import { LaboratoryTestCategory } from "../enums/laboratory-test-category.enum";

export class CreateLaboratoryTestDto {
  @IsMongoId()
  laboratory!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(LaboratoryTestCategory)
  category!: LaboratoryTestCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString()
  normalRange?: string;

  @IsOptional()
  @IsString()
  sampleType?: string;
}