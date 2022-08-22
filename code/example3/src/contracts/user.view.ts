import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';

@Exclude()
export class UserView {
  @Expose()
  @IsUUID()
  public id: string;

  @Expose()
  @IsString()
  public name: string;

  @Expose()
  @IsEmail()
  public email: string;
}
