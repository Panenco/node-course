import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Section } from "./section.entity";

@Entity()
export class Question extends BaseEntity<Question, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public label!: string;

  @Property({ default: 0 })
  public weight?: number;

  @Property()
  public relativeWeight: number = 0;

  @Property()
  public totalWeight: number = 0;

  @ManyToOne(() => Section, { name: 'section_id' })
  public sectionId!: string;
}