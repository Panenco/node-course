import { BaseEntity, Entity, Enum, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { RequestEnum } from "../utils/types";
import { Respondent } from "./respondent.entity";
import { Request } from './request.entity';
import { Team } from "./team.entity";

@Entity()
export class Offer extends BaseEntity<Offer, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Enum(() => RequestEnum)
  public type: RequestEnum;

  @ManyToOne(() => Team, { nullable: true })
  public supplier?: Team;

  @ManyToOne(() => Request, { nullable: true })
  public request?: Request;

  @ManyToOne(() => Respondent)
  public respondent: Respondent;
}