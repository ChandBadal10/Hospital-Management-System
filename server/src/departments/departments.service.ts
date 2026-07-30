import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { Model, Types } from 'mongoose';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { GetDepartmentDto } from './dto/gett-department.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectModel(Department.name)
        private readonly departmentModule: Model<DepartmentDocument>
    ) {}


    //create department
    async createDepartment(createDepartmentDto: CreateDepartmentDto, user: CurrentUser) {
        const {name, description, image} = createDepartmentDto;


        //check duplicate department
        const existingDepartment = await this.departmentModule.findOne({name});

        if(existingDepartment) {
            throw new BadRequestException("Department already exists")
        }

        // create department
        const department = await this.departmentModule.create({
            ...createDepartmentDto,
            createdBy: user.id,
            updatedBy: user.id
        });

        return {
            success: true,
            message: "Department created successfully",
            data: department
        }
    }


    //Get all departments
    async getAllDepartments(query: GetDepartmentDto) {
        const  { page = 1, limit = 10, search, sortBy = "createdAt", order = "desc", isActive, } = query;

        const filter: any = {};

        if(search) {
            filter.name = {
                $regex: search,
                $options: "i"
            }
        }

        if (isActive !== undefined) {
            filter.isActive = isActive
        }

        const departments = await this.departmentModule
        .find(filter)
         .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email")
        .sort({
            [sortBy]: order == "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)

        const total = await this.departmentModule.countDocuments(filter);

        return{
            success: true,
            message: "Departments fetched successfully",
            data: departments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    // get department by id
    async getDepartmentById(id: string) {
        if(!Types.ObjectId.isValid) {
            throw new BadRequestException("Invalid Department ID")
        }

        const department = await this.departmentModule.findById(id)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");

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

    async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto, user: CurrentUser) {
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
        department.updatedBy = new Types.ObjectId(user.id);
        await department.save();

        return {
            success: true,
            message: "Department updated successfully",
            data: department
        }
    }


    //Soft delete department

    async deleteDepartment(id: string) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Department ID")
        }

        const department = await this.departmentModule.findById(id);

        if(!department) {
            throw new BadRequestException("Department not found")
        }

        if(!department.isActive) {
            throw new BadRequestException("Department already deleted");
        }

        department.isActive = false;

        await department.save();

        return {
            success: true,
            message: "Department deleted successfully"
        };
    }


    //Restore department
    async restoreDepartment(id: string) {
        if(!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid Department ID");
        }

        const department = await this.departmentModule.findById(id);

        if(!department) {
            throw new BadRequestException("Department not found");
        }

        if(department.isActive) {
            throw new BadRequestException("Department is already active")
        }

        department.isActive = true;

        await department.save();

        return {
            success: true,
            message: "Department restored successfully",
            data: department
        }
    }
}
