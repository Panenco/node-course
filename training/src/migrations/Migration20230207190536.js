'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207190536 extends Migration {

  async up() {
    this.addSql('alter table "tender" drop constraint "tender_team_id_foreign";');

    this.addSql('alter table "request" drop constraint "request_tender_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_team_id_foreign";');

    this.addSql('alter table "tender" add constraint "tender_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "request" add constraint "request_tender_id_foreign" foreign key ("tender_id") references "tender" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "membership" add constraint "membership_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade on delete cascade;');
  }

  async down() {
    this.addSql('alter table "tender" drop constraint "tender_team_id_foreign";');

    this.addSql('alter table "request" drop constraint "request_tender_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_team_id_foreign";');

    this.addSql('alter table "tender" add constraint "tender_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade;');

    this.addSql('alter table "request" add constraint "request_tender_id_foreign" foreign key ("tender_id") references "tender" ("id") on update cascade;');

    this.addSql('alter table "membership" add constraint "membership_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade on delete set null;');
  }

}
exports.Migration20230207190536 = Migration20230207190536;
