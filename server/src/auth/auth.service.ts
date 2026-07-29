import { BadRequestException, Injectable } from '@nestjs/common';
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



@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
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

        const user = await this.userModel.findById(payload.sub);

        if(!user) {
            throw new BadRequestException("User not found");
        }
        console.log(user);
        return user;
        }
}
