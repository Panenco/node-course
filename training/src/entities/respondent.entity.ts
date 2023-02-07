import { BaseEntity, Entity, Enum, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { RequestEnum } from "../utils/types";
import { LegalEntity } from "./legalEntity.entity";
import { Team } from "./team.entity";
import { Tender } from "./tender.entity";

@Entity()
export class Respondent extends BaseEntity<Respondent, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Enum(() => RequestEnum)
  public type: RequestEnum;

  @ManyToOne(() => Tender, { name: 'tender_id' })
  public tenderId: string;

  @ManyToOne(() => Team, { name: 'team_id' })
  public teamId: string;

  @ManyToOne(() => LegalEntity, { name: 'legal_entity_id', nullable: true })
  public legalEntityId?: string;
}