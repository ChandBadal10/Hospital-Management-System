import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { RegisterDto } from './dto/register';
import { Role } from 'src/users/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from 'src/mail/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';



@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) {}


    //Generate Token
    private async generateTokens(user: UserDocument) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
            expiresIn: "15m",
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            expiresIn: "7d",
        })

        return {
            accessToken,
            refreshToken
        }
    }

    //Register
    async register(registerDto: RegisterDto) {
        const {firstName, lastName, email, password, phone} = registerDto;

        //Check existing user

        const existingUser = await this.userModel.findOne({email});

        if(existingUser) {
            throw new BadRequestException("Email already exists")
        }


        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create patient
        const user = await this.userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role: Role.PATIENT
        });

        return {
            success: true,
            message: "Register successfully",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        }
    }


    //Login
    async login(loginDto: LoginDto) {
        try{
            const {email, password} = loginDto;

            //Find user
            const user = await this.userModel.findOne({email});
            if(!user) {
                throw new BadRequestException("Invalid email or password")
            }


            //compare Password
            const isPasswordMatch = await bcrypt.compare(password, user.password);


            if(!isPasswordMatch) {
                throw new BadRequestException("Invalid Password")
            }

            //Check Account Status
            if(!user.isActive) {
                throw new BadRequestException("Your account has been deactivated")
            }

            const tokens = await this.generateTokens(user);

            const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);



            user.refreshToken = hashedRefreshToken;

            await user.save();

            return {
                success: true,
                message: "Login Successfully",
                data: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                    }
                }
            }


        } catch(error: any) {
            return {
                success: false,
                message: "Internal Server Error",
                error: error.message
            }
        }
    }

    //refreshtoken

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        },
        );

        const user = await this.userModel.findById(payload.sub).select("+refreshToken");

        if(!user) {
            throw new BadRequestException("User not found");
        }

        const isRefreshTokenMatched = await bcrypt.compare(refreshTokenDto.refreshToken, user.refreshToken!,)
            if(!isRefreshTokenMatched) {
                throw new UnauthorizedException("Invalid refresh token")
            }

        const tokens = await this.generateTokens(user);

        const hashedRefreshToken = await bcrypt.hash(
        tokens.refreshToken,
        10,
        );

        user.refreshToken = hashedRefreshToken;

        await user.save();

        return {
        success: true,
        message: "Token refreshed successfully",
        data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        },
    };
        }



    //Logout
    async logout(userId: string) {
        const user = await this.userModel.findById(userId).select("+refreshToken");

        if(!user) {
            throw new UnauthorizedException("User not found")
        }

        user.refreshToken = null;
        await user.save();

        return {
            success: true,
            message: "Logout Successfully",
        }
    }


    //Forgot password
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const {email} = forgotPasswordDto;

        //Find user
        const user = await this.userModel.findOne({email});

        if(!user) {
            throw new BadRequestException("User not found")
        }

        //Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        //Hash otp
        const hashedOtp = await bcrypt.hash(otp, 10);

        //Save otp
        user.passwordResetOtp = hashedOtp;

        //Expires in 5 min
        user.passwordResetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

        await user.save();

        await this.mailService.sendOtpEmail(
        user.email,
        otp,
        );

        return {
        success: true,
        message: "OTP sent successfully to your email.",
        };
    }



    //Verify otp
    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const {email, otp} = verifyOtpDto;

        //Find User
        const user = await this.userModel.findOne({email}).select("+passwordResetOtp +passwordResetOtpExpires");

        if(!user) {
            throw new BadRequestException("User not found");
        }

        //Check OTP exist
        if(!user.passwordResetOtp || !user.passwordResetOtpExpires) {
            throw new BadRequestException("OTP not found");
        }

        //Check expiry

        if(user.passwordResetOtpExpires < new Date()) {
            throw new BadRequestException("OTP has expired")
        }

        //compare otp

        const isOtpMatched = await bcrypt.compare(otp, user.passwordResetOtp);

        if(!isOtpMatched) {
            throw new BadRequestException("Invalid OTP")
        }

        return {
            success: true,
            message: "OTP veriofied successfully"
        }
    }


    //reset password
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const {email, newPassword} = resetPasswordDto;

        //FindUser
        const user = await this.userModel.findOne({email});

        if(!user) {
            throw new BadRequestException("User not found");
        }

        //Hash new password

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;

        user.passwordResetOtp = null;
        user.passwordResetOtpExpires = null;

        user.refreshToken = null;

        await user.save();

        return {
            success: true,
            message: "Password reset successfully",
        }
    }
}
