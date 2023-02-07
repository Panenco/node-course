import { Exclude, Expose } from "class-transformer";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { TeamType } from "../../utils/types";

@Exclude()
export class TeamBody {
  @Expose()
  @IsString()
  @Length(2, 50)
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @Expose()
  @IsEnum(TeamType)
  public type: TeamType;
}