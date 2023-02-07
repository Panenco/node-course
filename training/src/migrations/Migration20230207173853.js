'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207173853 extends Migration {

  async up() {
    this.addSql('alter table "section" drop column "relative_weight";');
    this.addSql('alter table "section" drop column "total_weight";');
  }

  async down() {
    this.addSql('alter table "section" add column "relative_weight" int not null default 0, add column "total_weight" int not null default 0;');
  }

}
exports.Migration20230207173853 = Migration20230207173853;
