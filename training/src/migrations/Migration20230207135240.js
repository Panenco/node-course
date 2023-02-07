'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207135240 extends Migration {

  async up() {
    this.addSql('alter table "tender" drop constraint "tender_team_id_foreign";');

    this.addSql('alter table "tender" alter column "team_id" drop default;');
    this.addSql('alter table "tender" alter column "team_id" type uuid using ("team_id"::text::uuid);');
    this.addSql('alter table "tender" alter column "team_id" drop not null;');
    this.addSql('alter table "tender" add constraint "tender_team_id_foreign" foreign key ("team_id") references "team" ("id") on delete cascade;');
  }

  async down() {
    this.addSql('alter table "tender" drop constraint "tender_team_id_foreign";');

    this.addSql('alter table "tender" alter column "team_id" drop default;');
    this.addSql('alter table "tender" alter column "team_id" type uuid using ("team_id"::text::uuid);');
    this.addSql('alter table "tender" alter column "team_id" set not null;');
    this.addSql('alter table "tender" add constraint "tender_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade;');
  }

}
exports.Migration20230207135240 = Migration20230207135240;
