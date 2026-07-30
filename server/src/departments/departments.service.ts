import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { Model, Types } from 'mongoose';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

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


    //Get all departments
    async getAllDepartments() {
        const departments = await this.departmentModule.find();

        return {
            success: true,
            message: "Department fetched successfully",
            data: departments
        }
    }

    // get department by id
    async getDepartmentById(id: string) {
        if(!Types.ObjectId.isValid) {
            throw new BadRequestException("Invalid Department ID")
        }

        const department = await this.departmentModule.findById(id);

        if(!department) {
            throw new BadRequestException("Department not found")
        }

        return {
            success: true,
            message: "Department fetched successfully",
            data: department
        }
    }


    //Update Department

    async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Department ID")
        }

        const department = await this.departmentModule.findById(id);

        if(!department) {
            throw new BadRequestException("Department not found")
        }

        if(updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
            const existingDepartment = await this.departmentModule.findOne({name: updateDepartmentDto.name});
            if(existingDepartment) {
                throw new BadRequestException("Department already exists")
            }
        }

        Object.assign(department, updateDepartmentDto);

        await department.save();

        return {
            success: true,
            message: "Department updated successfully",
            data: department
        }
    }
}
