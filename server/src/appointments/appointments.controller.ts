import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { GetAllAppointmentsDto } from './dto/get-all-appointments.dto';




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




}
