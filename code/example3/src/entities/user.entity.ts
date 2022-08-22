import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class User extends BaseEntity<User, "id"> {
  @PrimaryKey({ columnType: "uuid" })
  public id: string = v4();

  @Property()
  public name: string;

  @Property({ unique: true })
  public email: string;

  @Property()
  public password: string;
}
