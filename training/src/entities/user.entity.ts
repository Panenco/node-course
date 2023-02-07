import { Membership } from './membership.entity';
import { BaseEntity, Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';

@Entity()
export class User extends BaseEntity<User, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  public id: string = v4();

  @Property({ unique: true })
  public email: string;

  @Property()
  public name: string;

  @Property()
  public password: string;

  @OneToMany(() => Membership, membership => membership.user, { cascade: [Cascade.REMOVE] })
  memberships = new Collection<Membership>(this);
}
