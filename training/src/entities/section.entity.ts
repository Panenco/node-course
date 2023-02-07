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

  @ManyToOne(() => Request, { onDelete: 'cascade' })
  public request!: Request;
}