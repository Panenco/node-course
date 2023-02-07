import { IsString, IsOptional, Length, IsUUID } from 'class-validator';
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class TenderBody {
  @Expose()
  @IsString()
  public name!: string;

  @Expose()
  @IsOptional()
  @Length(2, 2000)
  public description!: string;
}