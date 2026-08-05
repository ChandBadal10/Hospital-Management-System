import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LaboratoryTestsService } from './laboratory-tests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { CreateLaboratoryTestDto } from './dto/create-laboratory-test.dto';
import { UpdateLaboratoryTestDto } from './dto/update-laboratory-test.dto';

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

    //get all laboratory test
    @Get()
    async getAllLaboratoryTest() {
        return this.laboratoryTestsService.getAllLaboratoryTest();
    }


    //Get by id
    @Get(":id")
    async getLaboratoryTestById(
        @Param("id") id: string
    ) {
        return this.laboratoryTestsService.getLaboratoryTestById(id);
    }

    //Update
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateLaboratoryTest(
        @Param("id") id: string,
        @Body() updateLaboratoryTestDto: UpdateLaboratoryTestDto,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryTestsService.updateLaboratoryTest(
            id,
            updateLaboratoryTestDto,
            user
        )
    }

    //Soft delete
    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deleteLaboratoryTest(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryTestsService.deleteLaboratoryTest(id, user)
    }

    //restore
    @Patch(":id/restore")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    restoreLaboratoryTest(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryTestsService.restoreLaboratoryTest(id, user);
    }
}
