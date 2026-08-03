import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Controller('medical-records')
export class MedicalRecordsController {
    constructor(
        private readonly medicalRecordsService: MedicalRecordsService
    ) {}


    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createMedicalRecord(
        @Body() createMedicalRecordDto: CreateMedicalRecordDto,
        @GetUser() user: CurrentUser
    ) {
        return this.medicalRecordsService.createMedicalRecord(createMedicalRecordDto, user)
    }


    @Get()
    @UseGuards(JwtAuthGuard)
    getAllMedicalRecords(){
        return this.medicalRecordsService.getAllMedicalRecords();
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    getMedicalRecordById(
        @Param("id") id: string
    ) {
        return this.medicalRecordsService.getMedicalRecordById(id);
    }

    //Update Medical Record
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateMedicalRecord(
        @Param("id") id: string,
        @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
        @GetUser() user: CurrentUser
    ) {
        return this.medicalRecordsService.updateMedicalRecord(
            id,
            updateMedicalRecordDto,
            user
        )
    }

    //Delte medical record
    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deletedMedicalRecord(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.medicalRecordsService.deleteMedicalRecord(id, user)
    }
}
