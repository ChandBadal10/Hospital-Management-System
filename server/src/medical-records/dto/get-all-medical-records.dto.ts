import { IsMongoId, IsNumberString, IsOptional } from "class-validator";

export class GetAllMedicalRecordsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsMongoId()
  patient?: string;

  @IsOptional()
  @IsMongoId()
  doctor?: string;

  @IsOptional()
  @IsMongoId()
  appointment?: string;
}