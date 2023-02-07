import { Nested, Numeric } from "@panenco/papi";
import { Exclude, Expose } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from "class-validator";
import { RequestEnum } from '../../utils/types';
import { TenderView } from "./tender.view";


@Exclude()
export class SectionView {
  @Expose()
  @IsUUID()
  public id!: string;
  
  @Expose()
  @IsString()
  public name!: string;

  @Expose()
  @Numeric()
  weight!: number;

  @Expose()
  @Numeric()
  relativeWeight!: number;

  @Expose()
  @Numeric()
  totalWeight!: number;

  @Expose()
  @IsUUID()
  public requestId!: string;
}