import { IsString, IsUUID } from 'class-validator';
import { Exclude, Expose } from "class-transformer";
import { Nested } from '@panenco/papi';
import { TeamView } from './team.view';

@Exclude()
export class TenderView {
	@Expose()
  @IsUUID()
  id!: string;

  @Expose()
  @IsString()
  public name!: string;

  @Expose()
  public description: string;

  @Expose()
  @Nested(TeamView)
  team!: TeamView;

	@Expose()
  @IsUUID()
  LegalEntityId?: string;
}