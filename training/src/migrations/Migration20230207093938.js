'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207093938 extends Migration {

  async up() {
    this.addSql('alter table "team" add column "creation_date" timestamptz(0) not null default now();');
  }

  async down() {
    this.addSql('alter table "team" drop column "creation_date";');
  }

}
exports.Migration20230207093938 = Migration20230207093938;
