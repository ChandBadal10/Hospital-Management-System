import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreatePatientDto } from './dto/create-patient.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { GetPatientsQueryDto } from './dto/get-patients-query.dto';

@Controller('patients')
export class PatientsController {
    constructor(
        private readonly patientsService: PatientsService
    ) {}

    //Create patients
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createPatient(
        @Body() createPatientDto: CreatePatientDto,
        @GetUser() user: CurrentUser
    ) {
        return this.patientsService.createPatient(createPatientDto, user);
    }

    //Get All Patients

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAllPatients(
        @Query() query: GetPatientsQueryDto,
    ) {
        return this.patientsService.getAllPatients(query);
    }


    //Get Patient by id
    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getPatientById(
        @Param("id") id: string,
    ) {
        return this.patientsService.getPatientById(id);
    }
}
