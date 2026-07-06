import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

@Exclude()
export class UserBody {
  @ApiProperty({ example: 'John Doe' })
  @Expose()
  @IsString()
  public name: string;

  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  @IsEmail()
  public email: string;

  @ApiProperty({ minLength: 8, example: 'password123' })
  @Expose()
  @IsString()
  @Length(8)
  public password: string;
}
