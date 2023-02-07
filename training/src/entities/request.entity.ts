import { BaseEntity, Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { RequestEnum } from "../utils/types";
import { Section } from "./section.entity";
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
  
  @ManyToOne(() => Tender, { onDelete: 'cascade' })
  public tender!: Tender;

  @OneToMany(() => Section, section => section.request, { cascade: [Cascade.REMOVE] })
  sections = new Collection<Section>(this);
}
