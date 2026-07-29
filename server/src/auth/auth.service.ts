import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { RegisterDto } from './dto/register';
import { Role } from 'src/users/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';



@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly jwtService: JwtService
    ) {}


    //Generate Token
    private async generateTokens(user: UserDocument) {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken
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

            return {
                success: true,
                message: "Login Successfully",
                data: {
                    accessToken: tokens.accessToken,
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
}
