'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207120827 extends Migration {

  async up() {
    this.addSql('alter table "answer" rename column "answer" to "answer_text";');
  }

  async down() {
    this.addSql('alter table "answer" rename column "answer_text" to "answer";');
  }

}
exports.Migration20230207120827 = Migration20230207120827;
