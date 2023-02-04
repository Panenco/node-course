import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

// For safety we'll exclude everything from being transformed by placing a @Exclude() decorator on the class declaration
@Exclude()
export class UserBody {
  // We can expose the properties we want included one by one
  @Expose()
  @IsString()
  public name: string;

  @Expose()
  // We can start adding validation decorators that specify exactly what we expect from the object we will be validating
  @IsEmail()
  public email: string;

  @Expose()
  @IsString()
  @Length(8)
  public password: string;
}