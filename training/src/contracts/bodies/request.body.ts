import { Exclude, Expose } from "class-transformer";
import { IsDateString, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { RequestEnum } from '../../utils/types';


@Exclude()
export class RequestBody {
  @Expose()
  @IsString()
  public name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
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
}