import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from "node:crypto"
@Entity()
export class User extends BaseEntity<User, "id"> {
  @PrimaryKey({ columnType: "uuid" })
  public id: string = randomUUID();

  @Property()
  public name: string;

  @Property({ unique: true })
  public email: string;

  @Property()
  public password: string;
}
