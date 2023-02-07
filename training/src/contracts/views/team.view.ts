import { Exclude, Expose } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { TeamType } from "../../utils/types";

@Exclude()
export class TeamView {
  @Expose()
  @IsUUID()
  public id!: string;

  @Expose()
  @IsString()
  public name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  public description?: string;

  @Expose()
  @IsEnum(TeamType)
  public type: TeamType;
}