import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LaboratoryTest, LaboratoryTestDocument } from './schemas/laboratory-test.schema';
import { Model, Types } from 'mongoose';
import { Laboratory, LaboratoryDocument } from 'src/laboratories/schemas/laboratory.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateLaboratoryTestDto } from './dto/create-laboratory-test.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Injectable()
export class LaboratoryTestsService {
    constructor(
        @InjectModel(LaboratoryTest.name)
        private laboratoryTestModel: Model<LaboratoryTestDocument>,

        @InjectModel(Laboratory.name)
        private laboratoryModel: Model<LaboratoryDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>
    ) {}


    async createLaboratoryTest(createLaboratoryTestDto: CreateLaboratoryTestDto, user: CurrentUser) {

        const laboratory = await this.laboratoryModel.findById(createLaboratoryTestDto.laboratory);
        if(!laboratory) {
            throw new NotFoundException("Laboratory not found")
        }

        const alreadyExists = await this.laboratoryTestModel.findOne({laboratory: createLaboratoryTestDto.laboratory, name: createLaboratoryTestDto.name, isActive: true});

        if(alreadyExists) {
            throw new BadRequestException("Laboratory test already exists")
        }

        const laboratoryTest = await this.laboratoryTestModel.create({
            ...createLaboratoryTestDto,
            createdBy: new Types.ObjectId(user.id),
            updatedBy: new Types.ObjectId(user.id)
        });


        const data = await this.laboratoryTestModel.findById(laboratoryTest._id)
        .populate("laboratory", "name location contactNumber")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

        return {
            success: true,
            message: "Laboratory test created successfully",
            data
        }
    }

    async getAllLaboratoryTest() {
        const laboratoryTests = await this.laboratoryTestModel.find({isActive: true})
        .populate("laboratory", "name location contactNumber")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")
        .sort({ createdAt: -1 });

        return {
            success: true,
            message: "Laboratory tests fetched successfully",
            data: laboratoryTests
        }
    }

    //get by id
    async getLaboratoryTestById(id: string) {
        const laboratoryTest = await this.laboratoryTestModel.findOne({_id: id, isActive: true})
        .populate("laboratory", "name location contactNumber")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")

        if(!laboratoryTest) {
            throw new NotFoundException("Laboratory test not found");
        }

        return {
            success: true,
            message: "Laboratory test fetched successfully",
            data: laboratoryTest
        }
    }


}
