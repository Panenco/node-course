'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207191447 extends Migration {

  async up() {
    this.addSql('alter table "membership" drop constraint "membership_user_id_foreign";');

    this.addSql('alter table "membership" add constraint "membership_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
  }

  async down() {
    this.addSql('alter table "membership" drop constraint "membership_user_id_foreign";');

    this.addSql('alter table "membership" add constraint "membership_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;');
  }

}
exports.Migration20230207191447 = Migration20230207191447;
