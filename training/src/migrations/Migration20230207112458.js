'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230207112458 extends Migration {

  async up() {
    this.addSql('alter table "post" drop constraint "post_author_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_respondent_id_id_foreign";');

    this.addSql('alter table "post" rename column "author_id" to "author_id_id";');
    this.addSql('alter table "post" add constraint "post_author_id_id_foreign" foreign key ("author_id_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "membership" rename column "respondent_id_id" to "respondent_id";');
    this.addSql('alter table "membership" add constraint "membership_respondent_id_foreign" foreign key ("respondent_id") references "respondent" ("id") on update cascade on delete set null;');
  }

  async down() {
    this.addSql('alter table "post" drop constraint "post_author_id_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_respondent_id_foreign";');

    this.addSql('alter table "post" rename column "author_id_id" to "author_id";');
    this.addSql('alter table "post" add constraint "post_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "membership" rename column "respondent_id" to "respondent_id_id";');
    this.addSql('alter table "membership" add constraint "membership_respondent_id_id_foreign" foreign key ("respondent_id_id") references "respondent" ("id") on update cascade on delete set null;');
  }

}
exports.Migration20230207112458 = Migration20230207112458;
