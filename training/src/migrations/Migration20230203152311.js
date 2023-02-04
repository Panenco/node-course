'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230203152311 extends Migration {

  async up() {
    this.addSql('create table "user" ("id" uuid not null, "email" varchar(255) not null, "name" varchar(255) not null, "password" varchar(255) not null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "post" ("id" uuid not null, "title" varchar(255) not null, "text" text not null, "creation_date" timestamptz(0) not null default now(), "updated_at" timestamptz(0) not null default now(), "author_id" uuid not null, constraint "post_pkey" primary key ("id"));');

    this.addSql('alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;');
  }

  async down() {
    this.addSql('alter table "post" drop constraint "post_author_id_foreign";');

    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "post" cascade;');
  }

}
exports.Migration20230203152311 = Migration20230203152311;
