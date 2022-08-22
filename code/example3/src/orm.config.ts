import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import path from 'path';

import config from './config';

export default {
  debug: true,
  migrations: {
    path: path.join(__dirname, "migrations"),
    tableName: "migrations",
    transactional: true,
    pattern: /^[\w-]+\d+\.(ts|js)$/,
    disableForeignKeys: false,
    emit: "js",
  },
  type: "postgresql",
  tsNode: true,
  entitiesTs: [path.join(process.cwd(), "**", "*.entity.ts")],
  entities: [path.join(process.cwd(), "**", "*.entity.ts")],
  user: config.postgres.user,
  password: config.postgres.password,
  dbName: config.postgres.db,
  host: config.postgres.host,
  port: config.postgres.port,
  ssl: false,
} as Options<PostgreSqlDriver>;
