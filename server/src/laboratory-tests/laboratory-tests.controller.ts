import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LaboratoryTestsService } from './laboratory-tests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { CreateLaboratoryTestDto } from './dto/create-laboratory-test.dto';

@Controller('laboratory-tests')
export class LaboratoryTestsController {
    constructor(
        private readonly laboratoryTestsService: LaboratoryTestsService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createLaboratoryTest(
        @Body() createLaboratoryTestDto: CreateLaboratoryTestDto,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryTestsService.createLaboratoryTest(createLaboratoryTestDto, user)
    }
}
