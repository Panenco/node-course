import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsNumberString, IsString, IsUUID } from 'class-validator';

@Exclude()
export class UserView {
  // If we want to exclude this id property for example we can just omit it from the class or explicitly place a @Exclude() decorator on the property.
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