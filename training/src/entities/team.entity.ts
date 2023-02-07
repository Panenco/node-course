import { BaseEntity, Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { TeamType } from "../utils/types";

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
}