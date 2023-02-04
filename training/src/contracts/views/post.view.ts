import { Exclude, Expose } from "class-transformer";
import { Date } from '@panenco/papi';
import { IsNumber, IsString, IsUUID } from "class-validator";

@Exclude()
export class PostView {
  @Expose()
  @IsUUID()  
  public id: string;

  @Expose()
  @IsString()
  public title: string;

  @Expose()
  @IsString()
  public text: string;

  @Expose()
  @Date()
  public creationDate: Date;

  @Expose()
  @IsString()
  public authorId: string;
}