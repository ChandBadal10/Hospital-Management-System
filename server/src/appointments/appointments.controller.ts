import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { GetAllAppointmentsDto } from './dto/get-all-appointments.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';




@Controller('appointments')
export class AppointmentsController {
    constructor(
        private readonly appointmentsService: AppointmentsService
    ) {}

    //Create Appointment
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createAppointment(
        @Body() createAppointmentDto: CreateAppointmentDto,
        @GetUser() user: CurrentUser,
    ) {
        return this.appointmentsService.createAppointment(createAppointmentDto, user)
    }


    //Get All Appointments
    @Get()
    @UseGuards(JwtAuthGuard)
    getAllAppointments(
        @Query() query: GetAllAppointmentsDto,
    ) {
        return this.appointmentsService.getAllAppointments(query);
    }


    //Get Appointments by id
    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAppointmentById(
    @Param("id") id: string,
    ) {
        return this.appointmentsService.getAppointmentById(id);
    }

    //Update Appointment
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateAppointment(
        @Param("id") id: string,
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @GetUser() user: CurrentUser
    ) {
        return this.appointmentsService.updateAppointment(id, updateAppointmentDto, user)
    }


    //Delete Appointment
    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deleteAppointment(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.appointmentsService.deleteAppointment(id, user)
    }

    //Restore Appointment
    @Patch(":id/restore")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    restoreAppointment(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.appointmentsService.restoreAppointment(id, user)
    }

}
