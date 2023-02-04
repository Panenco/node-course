import { Exclude, Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

@Exclude()
export class SearchQuery {
  @Expose()
  @IsString()
  @IsOptional()
  public search?: string;
}