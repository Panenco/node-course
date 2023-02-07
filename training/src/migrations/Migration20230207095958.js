'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207095958 extends Migration {

  async up() {
    this.addSql('alter table "tender" drop constraint "tender_legal_entity_id_foreign";');

    this.addSql('alter table "tender" alter column "legal_entity_id" drop default;');
    this.addSql('alter table "tender" alter column "legal_entity_id" type uuid using ("legal_entity_id"::text::uuid);');
    this.addSql('alter table "tender" alter column "legal_entity_id" drop not null;');
    this.addSql('alter table "tender" add constraint "tender_legal_entity_id_foreign" foreign key ("legal_entity_id") references "legal_entity" ("id") on update cascade on delete set null;');
  }

  async down() {
    this.addSql('alter table "tender" drop constraint "tender_legal_entity_id_foreign";');

    this.addSql('alter table "tender" alter column "legal_entity_id" drop default;');
    this.addSql('alter table "tender" alter column "legal_entity_id" type uuid using ("legal_entity_id"::text::uuid);');
    this.addSql('alter table "tender" alter column "legal_entity_id" set not null;');
    this.addSql('alter table "tender" add constraint "tender_legal_entity_id_foreign" foreign key ("legal_entity_id") references "legal_entity" ("id") on update cascade;');
  }

}
exports.Migration20230207095958 = Migration20230207095958;
