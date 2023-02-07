import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Team } from "./team.entity";

@Entity()
export class LegalEntity extends BaseEntity<LegalEntity, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public name: string;

  @Property()
  public email: string;

  @Property({ nullable: true })
  public phone?: string;

  @Property()
  public vatNumber: string;

  @ManyToOne(() => Team, { name: 'team_id' })
  public teamId!: string;
}