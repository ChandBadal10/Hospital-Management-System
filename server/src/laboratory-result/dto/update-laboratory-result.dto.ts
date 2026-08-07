import { PartialType } from "@nestjs/mapped-types";
import { CreateLaboratoryResultDto } from "./create-laboratory-result.dto";

export class UpdateLaboratoryResultDto extends PartialType(
  CreateLaboratoryResultDto,
) {}