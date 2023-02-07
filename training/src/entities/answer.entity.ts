import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { Offer } from "./offer.entity";
import { Question } from "./question.entity";

@Entity()
export class Answer extends BaseEntity<Answer, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public answerText: string;

  @ManyToOne(() => Offer)
  public offer: Offer;

  @ManyToOne(() => Question)
  public question: Question;
}