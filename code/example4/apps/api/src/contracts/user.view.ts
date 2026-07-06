import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';

@Exclude()
export class UserView {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  @IsUUID()
  public id: string;

  @ApiProperty()
  @Expose()
  @IsString()
  public name: string;

  @ApiProperty()
  @Expose()
  @IsEmail()
  public email: string;
}
