import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';


@Controller('laboratories')
export class LaboratoriesController {
    constructor(
        private readonly laboratoriesService: LaboratoriesService
    ) {}

    // Create Laboratories
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createLaboratory(
        @Body() createLaboratoryDto: CreateLaboratoryDto,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoriesService.createLaboratory(createLaboratoryDto, user)
    }

    //Get All Laboratories
    @Get()
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    getAllLaboratories() {
        return this.laboratoriesService.getAllLaboratories();
    }

    //Get by id
    @Get(":id")
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    getLaboratoryById(
        @Param("id") id: string
    ) {
        return this.laboratoriesService.getLaboratoryById(id);
    }
}
