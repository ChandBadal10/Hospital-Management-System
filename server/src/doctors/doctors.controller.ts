import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';

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
}
