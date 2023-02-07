import { BaseEntity, Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { RequestEnum } from "../utils/types";
import { Tender } from "./tender.entity";

@Entity()
export class Request extends BaseEntity<Request, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public name!: string;

  @Property({ nullable: true, type: 'text' })
  public description?: string;

  @Property()
  public startDate: Date;
  
  @Property()
  public endDate: Date;
  
  @Enum(() => RequestEnum)
  public type: RequestEnum;
  
  @ManyToOne(() => Tender, { name: 'tender_id' })
  public tenderId!: string;
}
