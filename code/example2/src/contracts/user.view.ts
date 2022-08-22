import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsString } from 'class-validator';

@Exclude()
export class UserView {
  @Expose()
  @IsNumber()
  public id: number;

  @Expose()
  @IsString()
  public name: string;

  @Expose()
  @IsEmail()
  public email: string;
}
