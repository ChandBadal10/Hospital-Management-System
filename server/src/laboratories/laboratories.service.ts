import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Laboratory, LaboratoryDocument } from './schemas/laboratory.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Injectable()
export class LaboratoriesService {
    constructor(
    @InjectModel(Laboratory.name)
    private laboratoryModel: Model<LaboratoryDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>
    ) {}

    async createLaboratory(createLaboratoryDto: CreateLaboratoryDto, user: CurrentUser) {
        const { name } = createLaboratoryDto;

        const existingLaboratory = await this.laboratoryModel.findOne({name, isActive: true});

        if(existingLaboratory) {
            throw new BadRequestException("Laboratory already exists");
        }

        const laboratory = await this.laboratoryModel.create({
            ...createLaboratoryDto,
            createdBy: new Types.ObjectId(user.id),
            updatedBy: new Types.ObjectId(user.id)
        });

        const populateLaboratory = await this.laboratoryModel.findById(laboratory._id)
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")

        return {
            success: true,
            message: "Laboratory created successfully",
            data: populateLaboratory
        }
    }

    //Get all
    async getAllLaboratories() {
        const laboratories = await this.laboratoryModel.find({isActive: true})
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName")

        return {
            success: true,
            message: "Laboratories fetched successfully",
            data: laboratories
        }
    }

    //Get by id
    async getLaboratoryById(id: string) {
    const laboratory = await this.laboratoryModel
        .findOne({
        _id: id,
        isActive: true,
        })
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

    if (!laboratory) {
        throw new NotFoundException("Laboratory not found");
    }

    return {
        success: true,
        message: "Laboratory fetched successfully",
        data: laboratory,
    };
    }




}
