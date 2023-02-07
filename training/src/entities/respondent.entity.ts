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

  @ManyToOne(() => Tender)
  public tender: Tender;

  @ManyToOne(() => Team)
  public team: Team;

  @ManyToOne(() => LegalEntity, { nullable: true })
  public legalEntity?: LegalEntity;
}