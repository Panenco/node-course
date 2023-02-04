import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';
import { User } from "./user.entity";

@Entity()
export class Post extends BaseEntity<Post, 'id'> {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = v4();

  @Property()
  title!: string;

  @Property({ type: 'text' })
  text!: string;

  @Property({ name: 'creation_date', defaultRaw: 'NOW()' })
  creationDate: Date = new Date();

  @Property({ defaultRaw: `now()`, onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  @ManyToOne(() => User, { name: 'author_id' })
  authorId: string;
}