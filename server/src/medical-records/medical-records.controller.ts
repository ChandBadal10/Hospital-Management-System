import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';

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
}
