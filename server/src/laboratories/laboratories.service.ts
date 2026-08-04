import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Laboratory, LaboratoryDocument } from './schemas/laboratory.schema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';

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


    //Update
    async updateLaboratory(id: string, updateLaboratoryDto: UpdateLaboratoryDto, user: CurrentUser) {
        const laboratory = await this.laboratoryModel.findOne({_id: id, isActive: true});

        if(!laboratory) {
            throw new NotFoundException("Laboratory not found")
        }

        if(updateLaboratoryDto.name && updateLaboratoryDto.name !== laboratory.name) {
            const existingLaboratory = await this.laboratoryModel.findOne({
                name: updateLaboratoryDto.name,
                isActive: true
            });

            if(existingLaboratory) {
                throw new BadRequestException("Laboratory already exists");
            }
        }
        Object.assign(laboratory, updateLaboratoryDto);
        laboratory.updatedBy = new Types.ObjectId(user.id);

        await laboratory.save();

        await laboratory.save();

        const updatedLaboratory = await this.laboratoryModel
            .findById(laboratory._id)
            .populate("createdBy", "firstName lastName")
            .populate("updatedBy", "firstName lastName");

        return {
            success: true,
            message: "Laboratory updated successfully",
            data: updatedLaboratory,
        };

    }


    //soft delete
    async deleteLaboratory(id: string, user: CurrentUser) {
        const laboratory = await this.laboratoryModel.findOne({_id: id, isActive: true});

        if(!laboratory) {
            throw new BadRequestException("Laboratory not found")
        }

        laboratory.isActive = false;
        laboratory.updatedBy = new Types.ObjectId(user.id);

        await laboratory.save();

        return {
            success: true,
            message: "Laboratory deleted successfully"
        }
    }

    //restore
    async restoreLaboratory(id: string, user: CurrentUser) {
        const laboratory = await this.laboratoryModel.findById(id);
        if(!laboratory) {
            throw new NotFoundException("Laboratory not found")
        }

        if(laboratory.isActive) {
            throw new BadRequestException("Laboratory already active")
        }

        laboratory.isActive = true;
        laboratory.updatedBy = new Types.ObjectId(user.id);

        await laboratory.save();

        return {
            success: true,
            message: "Laboratory restore successfully"
        }
    }

}
