import { Nested } from "@panenco/papi";
import { Exclude, Expose } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from "class-validator";
import { RequestEnum } from '../../utils/types';
import { TenderView } from "./tender.view";


@Exclude()
export class RequestView {
  @Expose()
  @IsUUID()
  public id!: string;
  
  @Expose()
  @IsString()
  public name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsDateString()
  public startDate: Date;

  @Expose()
  @IsDateString()
  public endDate: Date;

  @Expose()
  @IsEnum(RequestEnum)
  public type: RequestEnum;

  @Expose()
  @Nested(TenderView)
  tender!: TenderView;
}