import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UpdateDoctorDto } from './dto/update-doctor.dot';

@Controller('doctors')
export class DoctorsController {
    constructor(
        private readonly doctorsService: DoctorsService,
    ) {}

    //Create Doctor API
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createDoctor(
        @Body() createDoctotDto: CreateDoctorDto,
        @GetUser() user: CurrentUser,
    ) {
        return this.doctorsService.createDoctor(createDoctotDto, user)
    }

    //Get All Doctors
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAllDoctors() {
        return this.doctorsService.getAllDoctors();
    }

    //Get Doctor by iD

    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getDoctorById(
        @Param("id") id: string
    ) {
        return this.doctorsService.getDoctorById(id);
    }


    //update doctor info
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateDoctor(
        @Param("id") id: string,
        @Body() updateDoctorDto: UpdateDoctorDto,
        @GetUser() user: CurrentUser,
    ) {
        return this.doctorsService.updateDoctor(id, updateDoctorDto, user)
    }

    //delete doctor

    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deleteDoctor(
        @Param("id") id: string,
        @GetUser() user: CurrentUser,
    ) {
        return this.doctorsService.deleteDoctor(id, user);
    }

    //Restore Doctot
    @Patch(":id/restore")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    restoreDoctor(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.doctorsService.restoreDoctor(id, user)
    }
}
