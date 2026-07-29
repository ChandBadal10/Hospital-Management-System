import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { RegisterDto } from './dto/register';
import { Role } from 'src/users/enums/role.enum';
import * as bcrypt from 'bcryptjs';



@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly jwtService: JwtService
    ) {}

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
}
