import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Controller('prescriptions')
export class PrescriptionsController {
    constructor(
        private readonly prescriptionsService: PrescriptionsService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createPrescription(
        @Body() createPrescriptionDto: CreatePrescriptionDto,
        @GetUser() user: CurrentUser
    ) {
        return this.prescriptionsService.createPrescription(createPrescriptionDto, user)
    }
}
