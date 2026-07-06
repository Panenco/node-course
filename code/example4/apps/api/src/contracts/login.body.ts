import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

@Exclude()
export class LoginBody {
  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'password123' })
  @Expose()
  @IsString()
  public password: string;
}
