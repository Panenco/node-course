import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Exclude()
export class AccessTokenView {
  @Expose()
  @IsString()
  public token: string;

  @Expose()
  @IsNumber()
  public expiresIn: number;
}
