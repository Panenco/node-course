import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import path from "node:path";

import config from "./config";

export default {
	type: "postgresql",
	host: config.postgres.host,
	port: config.postgres.port,
	user: config.postgres.user,
	password: config.postgres.password,
	dbName: config.postgres.db,
	// Use ts files for development with ts-node
	entities: [path.join(__dirname, "**", "*.entity.ts")],
	// Use compiled js files for production builds
	entitiesTs: [path.join(__dirname, "**", "*.entity.ts")],
	migrations: {
		tableName: "mikro_orm_migrations",
		path: path.join(__dirname, "migrations"),
		glob: "!(*.d).{js,ts}",
	},
	debug: true,
} as Options<PostgreSqlDriver>;
