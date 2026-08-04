import {
IsArray,
IsMongoId,
IsNotEmpty,
IsOptional,
IsString,
ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class MedicineDto {

@IsString()
medicineName!: string;

@IsString()
dosage!: string;

@IsString()
frequency!: string;

@IsString()
duration!: string;

@IsString()
instruction!: string;

}

export class CreatePrescriptionDto {

@IsMongoId()
medicalRecord!: string;

@IsMongoId()
patient!: string;

@IsMongoId()
doctor!: string;

@IsMongoId()
appointment!: string;

@IsArray()
@ValidateNested({ each: true })
@Type(() => MedicineDto)
medicines!: MedicineDto[];

@IsOptional()
@IsString()
notes?: string;

}