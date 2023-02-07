import { Tender } from './tender.entity';
import { BaseEntity, Cascade, Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Respondent } from "./respondent.entity";
import { Team } from "./team.entity";
import { User } from "./user.entity";

@Entity()
export class Membership extends BaseEntity<Membership, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @ManyToOne(() => User, { nullable: true, onDelete: 'cascade' })
  public user?: User;

  @ManyToOne(() => Team, { nullable: true, onDelete: 'cascade' })
  public team?: Team;

  @ManyToOne(() => Tender, { nullable: true })
  public tender?: Tender;

  @ManyToOne(() => Respondent, { nullable: true })
  public respondent?: Respondent;
}