import { PartialType } from "@nestjs/mapped-types";
import { CreateLaboratoryTestDto } from "./create-laboratory-test.dto";

export class UpdateLaboratoryTestDto extends PartialType(
  CreateLaboratoryTestDto,
) {}