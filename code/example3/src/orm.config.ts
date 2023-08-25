import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as url from "node:url";
import path from 'node:path';

import config from './config.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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
  entities: [path.join(process.cwd(), "**", "*.entity.js")],
  user: config.postgres.user,
  password: config.postgres.password,
  dbName: config.postgres.db,
  host: config.postgres.host,
  port: config.postgres.port,
  ssl: false,
} as Options<PostgreSqlDriver>;
