'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20230206190031 extends Migration {

  async up() {
    this.addSql('create table "team" ("id" uuid not null, "name" varchar(255) not null, "type" text check ("type" in (\'buyer\', \'supplier\')) not null default \'buyer\', "description" text null, constraint "team_pkey" primary key ("id"));');

    this.addSql('create table "legal_entity" ("id" uuid not null, "name" varchar(255) not null, "email" varchar(255) not null, "phone" varchar(255) null, "vat_number" varchar(255) not null, "team_id" uuid not null, constraint "legal_entity_pkey" primary key ("id"));');

    this.addSql('create table "tender" ("id" uuid not null, "name" varchar(255) not null, "description" text null, "team_id" uuid not null, "legal_entity_id" uuid not null, constraint "tender_pkey" primary key ("id"));');

    this.addSql('create table "respondent" ("id" uuid not null, "type" text check ("type" in (\'questionnaire\', \'sheet\')) not null, "tender_id" uuid not null, "team_id" uuid not null, "legal_entity_id" uuid null, constraint "respondent_pkey" primary key ("id"));');

    this.addSql('create table "request" ("id" uuid not null, "name" varchar(255) not null, "description" text null, "start_date" timestamptz(0) not null, "end_date" timestamptz(0) not null, "type" text check ("type" in (\'questionnaire\', \'sheet\')) not null, "tender_id" uuid not null, constraint "request_pkey" primary key ("id"));');

    this.addSql('create table "section" ("id" uuid not null, "name" varchar(255) not null, "weight" int not null default 0, "relative_weight" int not null default 0, "total_weight" int not null default 0, "request_id" uuid not null, constraint "section_pkey" primary key ("id"));');

    this.addSql('create table "question" ("id" uuid not null, "label" varchar(255) not null, "weight" int not null default 0, "relative_weight" int not null default 0, "total_weight" int not null default 0, "section_id" uuid not null, constraint "question_pkey" primary key ("id"));');

    this.addSql('create table "offer" ("id" uuid not null, "type" text check ("type" in (\'questionnaire\', \'sheet\')) not null, "supplier_id" uuid null, "request_id" uuid null, "respondent_id" uuid not null, constraint "offer_pkey" primary key ("id"));');

    this.addSql('create table "answer" ("id" uuid not null, "answer" varchar(255) not null, "offer_id" uuid not null, "question_id" uuid not null, constraint "answer_pkey" primary key ("id"));');

    this.addSql('create table "membership" ("id" uuid not null, "user_id" uuid null, "team_id" uuid null, "tender_id" uuid null, "respondent_id_id" uuid null, constraint "membership_pkey" primary key ("id"));');

    this.addSql('alter table "legal_entity" add constraint "legal_entity_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade;');

    this.addSql('alter table "tender" add constraint "tender_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade;');
    this.addSql('alter table "tender" add constraint "tender_legal_entity_id_foreign" foreign key ("legal_entity_id") references "legal_entity" ("id") on update cascade;');

    this.addSql('alter table "respondent" add constraint "respondent_tender_id_foreign" foreign key ("tender_id") references "tender" ("id") on update cascade;');
    this.addSql('alter table "respondent" add constraint "respondent_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade;');
    this.addSql('alter table "respondent" add constraint "respondent_legal_entity_id_foreign" foreign key ("legal_entity_id") references "legal_entity" ("id") on update cascade on delete set null;');

    this.addSql('alter table "request" add constraint "request_tender_id_foreign" foreign key ("tender_id") references "tender" ("id") on update cascade;');

    this.addSql('alter table "section" add constraint "section_request_id_foreign" foreign key ("request_id") references "request" ("id") on update cascade;');

    this.addSql('alter table "question" add constraint "question_section_id_foreign" foreign key ("section_id") references "section" ("id") on update cascade;');

    this.addSql('alter table "offer" add constraint "offer_supplier_id_foreign" foreign key ("supplier_id") references "team" ("id") on update cascade on delete set null;');
    this.addSql('alter table "offer" add constraint "offer_request_id_foreign" foreign key ("request_id") references "request" ("id") on update cascade on delete set null;');
    this.addSql('alter table "offer" add constraint "offer_respondent_id_foreign" foreign key ("respondent_id") references "respondent" ("id") on update cascade;');

    this.addSql('alter table "answer" add constraint "answer_offer_id_foreign" foreign key ("offer_id") references "offer" ("id") on update cascade;');
    this.addSql('alter table "answer" add constraint "answer_question_id_foreign" foreign key ("question_id") references "question" ("id") on update cascade;');

    this.addSql('alter table "membership" add constraint "membership_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;');
    this.addSql('alter table "membership" add constraint "membership_team_id_foreign" foreign key ("team_id") references "team" ("id") on update cascade on delete set null;');
    this.addSql('alter table "membership" add constraint "membership_tender_id_foreign" foreign key ("tender_id") references "tender" ("id") on update cascade on delete set null;');
    this.addSql('alter table "membership" add constraint "membership_respondent_id_id_foreign" foreign key ("respondent_id_id") references "respondent" ("id") on update cascade on delete set null;');
  }

  async down() {
    this.addSql('alter table "legal_entity" drop constraint "legal_entity_team_id_foreign";');

    this.addSql('alter table "tender" drop constraint "tender_team_id_foreign";');

    this.addSql('alter table "respondent" drop constraint "respondent_team_id_foreign";');

    this.addSql('alter table "offer" drop constraint "offer_supplier_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_team_id_foreign";');

    this.addSql('alter table "tender" drop constraint "tender_legal_entity_id_foreign";');

    this.addSql('alter table "respondent" drop constraint "respondent_legal_entity_id_foreign";');

    this.addSql('alter table "respondent" drop constraint "respondent_tender_id_foreign";');

    this.addSql('alter table "request" drop constraint "request_tender_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_tender_id_foreign";');

    this.addSql('alter table "offer" drop constraint "offer_respondent_id_foreign";');

    this.addSql('alter table "membership" drop constraint "membership_respondent_id_id_foreign";');

    this.addSql('alter table "section" drop constraint "section_request_id_foreign";');

    this.addSql('alter table "offer" drop constraint "offer_request_id_foreign";');

    this.addSql('alter table "question" drop constraint "question_section_id_foreign";');

    this.addSql('alter table "answer" drop constraint "answer_question_id_foreign";');

    this.addSql('alter table "answer" drop constraint "answer_offer_id_foreign";');

    this.addSql('drop table if exists "team" cascade;');

    this.addSql('drop table if exists "legal_entity" cascade;');

    this.addSql('drop table if exists "tender" cascade;');

    this.addSql('drop table if exists "respondent" cascade;');

    this.addSql('drop table if exists "request" cascade;');

    this.addSql('drop table if exists "section" cascade;');

    this.addSql('drop table if exists "question" cascade;');

    this.addSql('drop table if exists "offer" cascade;');

    this.addSql('drop table if exists "answer" cascade;');

    this.addSql('drop table if exists "membership" cascade;');
  }

}
exports.Migration20230206190031 = Migration20230206190031;
