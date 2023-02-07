import { BaseEntity, Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { LegalEntity } from "./legalEntity.entity";
import { Request } from "./request.entity";
import { Team } from "./team.entity";

@Entity()
export class Tender extends BaseEntity<Tender, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  public name!: string;

  @Property({ nullable: true, type: 'text' })
  public description?: string;

  @ManyToOne(() => Team, { onDelete: 'cascade' })
  public team!: Team;

  @ManyToOne(() => LegalEntity, { nullable: true })
  public legalEntity?: LegalEntity;

  @OneToMany(() => Request, request => request.tender, { cascade: [Cascade.REMOVE] })
  requests = new Collection<Request>(this);
}
