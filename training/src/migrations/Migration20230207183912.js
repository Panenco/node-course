'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207183912 extends Migration {

  async up() {
    this.addSql('alter table "section" drop constraint "section_request_id_foreign";');

    this.addSql('alter table "section" add constraint "section_request_id_foreign" foreign key ("request_id") references "request" ("id") on update cascade on delete cascade;');
  }

  async down() {
    this.addSql('alter table "section" drop constraint "section_request_id_foreign";');

    this.addSql('alter table "section" add constraint "section_request_id_foreign" foreign key ("request_id") references "request" ("id") on update cascade;');
  }

}
exports.Migration20230207183912 = Migration20230207183912;
