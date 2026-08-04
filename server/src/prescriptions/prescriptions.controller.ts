import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Controller('prescriptions')
export class PrescriptionsController {
    constructor(
        private readonly prescriptionsService: PrescriptionsService,
    ) {}

    //Create Prescription
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createPrescription(
        @Body() createPrescriptionDto: CreatePrescriptionDto,
        @GetUser() user: CurrentUser
    ) {
        return this.prescriptionsService.createPrescription(createPrescriptionDto, user)
    }

    // Get All Prescription
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAllPrescription() {
        return this.prescriptionsService.getAllPrescriptions();
    }

    //Ger prescription by id
    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getPrescriptionById(
        @Param("id") id: string
    ) {
        return this.prescriptionsService.getPrescriptionById(id);
    }

    //Update Prescription
    @Patch(":id")
    @UseGuards(JwtAuthGuard, UseGuards)
    @Roles(Role.ADMIN)
    updatePrescription(
        @Param("id") id: string,
        @Body() updatePrescriptionDto: UpdatePrescriptionDto,
        @GetUser() user: CurrentUser
    ) {
        return this.prescriptionsService.updatePrescription(id, updatePrescriptionDto, user)
    }

    //Delete Prescription
    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deletePrescription(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.prescriptionsService.deletePrescription(id, user);
    }

    //Restore Prescription
    @Patch(":id/restore")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    restorePrescription(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.prescriptionsService.restorePrescription(id, user);
    }
}
