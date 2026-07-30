import { IsNotEmpty, IsOptional, IsString } from "class-validator";



export class CreateDepartmentDto {

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsOptional()
    @IsString()
    image?: string;
}