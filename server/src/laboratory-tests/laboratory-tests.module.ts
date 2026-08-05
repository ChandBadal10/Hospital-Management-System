import { Module } from '@nestjs/common';
import { LaboratoryTestsController } from './laboratory-tests.controller';
import { LaboratoryTestsService } from './laboratory-tests.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Laboratory, LaboratorySchema } from 'src/laboratories/schemas/laboratory.schema';
import { LaboratoryTest, LaboratoryTestSchema } from './schemas/laboratory-test.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LaboratoryTest.name,
        schema: LaboratoryTestSchema
      },

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

  controllers: [LaboratoryTestsController],
  providers: [LaboratoryTestsService]
})
export class LaboratoryTestsModule {}
