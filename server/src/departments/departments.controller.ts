import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/users/enums/role.enum';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetDepartmentDto } from './dto/gett-department.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Controller('departments')
export class DepartmentsController {
    constructor(
        private readonly departmentsService: DepartmentsService,
    ) {}

    //Create Department
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createDepartment(
        @Body() createDepartmentDto: CreateDepartmentDto,
        @GetUser() user: CurrentUser,
    ) {
        return this.departmentsService.createDepartment(createDepartmentDto, user);
    }

    //get all departments
    @Get()
    getAllDepartments(
        @Query() query: GetDepartmentDto,
    ) {
        return this.departmentsService.getAllDepartments(query);
    }

    //get department by id

    @Get(":id")
    getDepartmentById(
        @Param("id") id: string
    ) {
        return this.departmentsService.getDepartmentById(id);
    }



    //Update department
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateDepartment(
        @Param("id") id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
        @GetUser() user: CurrentUser,
    ) {
        return this.departmentsService.updateDepartment(id, updateDepartmentDto, user);
    }


    //delete department
    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deleteDepartment(
        @Param("id") id: string
    ) {
        return this.departmentsService.deleteDepartment(id)
    }

    //restore department

    @Patch(":id/restore")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    restoreDepartment(
        @Param("id") id: string
    ) {
        return this.departmentsService.restoreDepartment(id);
    }


}
