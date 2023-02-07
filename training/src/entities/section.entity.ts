import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Request } from "./request.entity";

@Entity()
export class Section extends BaseEntity<Section, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public name!: string;

  @Property({ default: 0 })
  public weight?: number;

  @Property()
  public relativeWeight: number = 0;

  @Property()
  public totalWeight: number = 0;

  @ManyToOne(() => Request, { name: 'request_id' })
  public requestId!: string;
}