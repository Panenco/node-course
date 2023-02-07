import { Tender } from './tender.entity';
import { BaseEntity, Cascade, Collection, Entity, Enum, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { TeamType } from "../utils/types";
import { Membership } from "./membership.entity";

@Entity()
export class Team extends BaseEntity<Team, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();
  
  @Property()
  name!: string;

  @Enum({ items: () => TeamType, default: TeamType.buyer })
  type!: TeamType;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ name: 'creation_date', defaultRaw: 'NOW()' })
  creationDate: Date = new Date();

  @OneToMany(() => Membership, membership => membership.team, { cascade: [Cascade.REMOVE] })
  memberships = new Collection<Membership>(this);

  @OneToMany(() => Tender, tender => tender.team, { cascade: [Cascade.REMOVE] })
  tenders = new Collection<Tender>(this);
}
