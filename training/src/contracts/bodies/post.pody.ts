import { Exclude, Expose } from "class-transformer";
import { IsString, Length } from "class-validator";

@Exclude()
export class PostBody {
  @Expose()
  @IsString()
  @Length(2, 50)
  title: string;

  @Expose()
  @IsString()
  @Length(2, 2000)
  text: string;
}