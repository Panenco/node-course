import { Tender } from './tender.entity';
import { BaseEntity, Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Respondent } from "./respondent.entity";
import { Team } from "./team.entity";
import { User } from "./user.entity";

@Entity()
export class Membership extends BaseEntity<Membership, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @ManyToOne(() => User, { nullable: true, name: 'user_id' })
  public userId?: string;

  @ManyToOne(() => Team, { nullable: true, name: 'team_id' })
  public teamId?: string;

  @ManyToOne(() => Tender, { nullable: true, name: 'tender_id' })
  public tenderId?: string;

  @ManyToOne(() => Respondent, { nullable: true })
  public respondentId?: string;
}