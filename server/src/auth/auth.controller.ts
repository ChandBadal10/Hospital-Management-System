import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import type { CurrentUser } from './interfaces/current-user.interface';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}


    //register
    @Post("register")
    register(
        @Body() registerDto: RegisterDto
    ) {
        return this.authService.register(registerDto)
    }


    // login
    @Post("login")
    login(
        @Body() loginDto: LoginDto
    ) {
        return this.authService.login(loginDto)
    }


    //get profile
    @Get("profile")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PATIENT, Role.ADMIN)
    getProfile(
        @GetUser() user: CurrentUser
    ) {
        return {
            success: true,
            message: "Profile fetched successfully",
            data: user
        }
    }


    //refresh-token
    @Post('refresh-token')
    async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    ) {
    return this.authService.refreshToken(refreshTokenDto);
}


    //get admin
    @Get("admin")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
        adminRoute() {
            return {
                success: true,
                message: "Welcome Admin"
            }
        }


    //logout
    @Post("logout")
    @UseGuards(JwtAuthGuard)
    logout(
        @GetUser() user: CurrentUser,
    ) {
        return this.authService.logout(user.id);
    }

    //Forgot password

    @Post("forgot-password")
    forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }



}

