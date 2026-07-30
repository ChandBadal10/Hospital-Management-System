import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { Model } from 'mongoose';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectModel(Department.name)
        private readonly departmentModule: Model<DepartmentDocument>
    ) {}


    //create department
    async createDepartment(createDepartmentDto: CreateDepartmentDto) {
        const {name, description, image} = createDepartmentDto;


        //check duplicate department
        const existingDepartment = await this.departmentModule.findOne({name});

        if(existingDepartment) {
            throw new BadRequestException("Department already exists")
        }

        // create department
        const department = await this.departmentModule.create({
            name,
            description,
            image,
        });

        return {
            success: true,
            message: "Department created successfully",
            data: department
        }
    }
}
