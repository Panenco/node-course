import { Numeric } from "@panenco/papi";
import { Exclude, Expose } from "class-transformer";
import { IsString, Length, Min } from "class-validator";

@Exclude()
export class SectionBody {
  @Expose()
  @IsString()
  @Length(2, 255)
  public name!: string;

  @Expose()
  @Numeric()
  @Min(0)
  public weight: number;
}