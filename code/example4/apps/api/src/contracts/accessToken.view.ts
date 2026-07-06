import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Exclude()
export class AccessTokenView {
  @ApiProperty()
  @Expose()
  @IsString()
  public token: string;

  @ApiProperty({ example: 3600 })
  @Expose()
  @IsNumber()
  public expiresIn: number;
}
