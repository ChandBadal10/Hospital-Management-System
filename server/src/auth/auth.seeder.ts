import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class AuthSeeder implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdmin();
  }

  private async createAdmin() {
    const admin = await this.userModel.findOne({
      role: Role.ADMIN,
    });

    if (admin) {
      console.log('✅ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      this.configService.getOrThrow('ADMIN_PASSWORD'),
      10,
    );

    await this.userModel.create({
      firstName: this.configService.getOrThrow('ADMIN_FIRST_NAME'),
      lastName: this.configService.getOrThrow('ADMIN_LAST_NAME'),
      email: this.configService.getOrThrow('ADMIN_EMAIL'),
      password: hashedPassword,
      phone: this.configService.getOrThrow('ADMIN_PHONE'),
      role: Role.ADMIN,
      isVerified: true,
    });

    console.log('✅ Default Admin Created');
  }
}