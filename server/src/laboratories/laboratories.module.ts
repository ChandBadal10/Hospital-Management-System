import { Module } from '@nestjs/common';
import { LaboratoriesController } from './laboratories.controller';
import { LaboratoriesService } from './laboratories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Laboratory, LaboratorySchema } from './schemas/laboratory.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name: Laboratory.name,
        schema: LaboratorySchema
      },
      {
        name: User.name,
        schema: UserSchema
      }
    ])
  ],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService]
})
export class LaboratoriesModule {}
