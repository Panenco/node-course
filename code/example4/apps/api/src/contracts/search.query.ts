import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

@Exclude()
export class SearchQuery {
  @ApiPropertyOptional({ description: 'Filter users by name or email' })
  @Expose()
  @IsString()
  @IsOptional()
  public search?: string;
}
