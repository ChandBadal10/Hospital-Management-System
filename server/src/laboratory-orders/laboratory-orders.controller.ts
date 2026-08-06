import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LaboratoryOrdersService } from './laboratory-orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateLaboratoryOrderDto } from './dto/create-laboratory-order.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UpdateLaboratoryOrderDto } from './dto/update-laboratory-order.dto';

@Controller('laboratory-orders')
export class LaboratoryOrdersController {
    constructor(
        private readonly laboratoryOrdersService: LaboratoryOrdersService
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createLaboratoryOrder(
        @Body() createLaboratoryOrderDto: CreateLaboratoryOrderDto,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryOrdersService.createLaboratoryOrder(createLaboratoryOrderDto, user)
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAllLaboratoryOrder(
    ) {
        return this.laboratoryOrdersService.getAllLaboratoryOrder()
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getLaboratoryOrderById(
        @Param("id") id: string,

    ) {
        return this.laboratoryOrdersService.getLaboratoryOrderById(id);
    }

    //Update
    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateLaboratoryOrder(
        @Param("id") id: string,
        @Body() updateLaboratoryOrderDto: UpdateLaboratoryOrderDto,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryOrdersService.updateLaboratoryOrder(id, updateLaboratoryOrderDto, user)
    }

    //Delete
    @Patch(":id/delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    deleteLaboratoryOrder(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryOrdersService.deleteLaboratoryOrder(id, user)
    }

    //Restore Laboratory Order
    @Patch(":id/restore")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    restoreLaboratoryOrder(
        @Param("id") id: string,
        @GetUser() user: CurrentUser
    ) {
        return this.laboratoryOrdersService.restoreLaboratoryOrder(id, user);
    }
}
