import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { LegalEntity } from "./legalEntity.entity";
import { Team } from "./team.entity";

@Entity()
export class Tender extends BaseEntity<Tender, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public name!: string;

  @Property({ nullable: true, type: 'text' })
  public description?: string;

  @ManyToOne(() => Team, { name: 'team_id' })
  public teamId!: string;

  @ManyToOne(() => LegalEntity, { name: 'legal_entity_id' })
  public legalEntityId!: string;
}