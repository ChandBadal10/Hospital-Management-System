import {
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { AppointmentStatus } from "../enums/appointment-status.enum";
import { PaymentStatus } from "../enums/payment-status.enum";

export class GetAllAppointmentsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsMongoId()
  doctor?: string;

  @IsOptional()
  @IsMongoId()
  patient?: string;

  @IsOptional()
  @IsMongoId()
  department?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  appointmentDate?: string;
}