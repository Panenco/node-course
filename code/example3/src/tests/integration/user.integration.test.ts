import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { StatusCode } from "@panenco/papi";
import { expect } from "chai";
import { before, beforeEach, describe, it } from "mocha";
import supertest from "supertest";

import { App } from "../../app";
import { User } from "../../entities/user.entity";

describe("Integration tests", () => {
	describe("User Tests", () => {
		let request: any;
		let orm: MikroORM<PostgreSqlDriver>;

		before(async () => {
			const app = new App();
			await app.createConnection();
			orm = app.orm;
			request = supertest(app.host);
		});

		beforeEach(async () => {
			const generator = orm.getSchemaGenerator();
			await generator.refreshDatabase();
		});

		it("should CRUD users", async () => {
			// Successfully create new user (no auth required)
			const { body: createResponse } = await request
				.post(`/api/users`)
				.send({
					name: "test",
					email: "test-user+1@panenco.com",
					password: "real secret stuff",
				} as User)
				.expect(StatusCode.created);

			expect(createResponse.name).equal("test");
			expect(createResponse.email).equal("test-user+1@panenco.com");

			// Create auth user and get token for protected endpoints
			const { body: authUser } = await request
				.post(`/api/users`)
				.send({
					name: "auth-user",
					email: "auth@test.com",
					password: "password123",
				})
				.expect(StatusCode.created);

			const { body: tokenResponse } = await request
				.post(`/api/auth/login`)
				.send({
					email: "auth@test.com",
					password: "password123",
				})
				.expect(StatusCode.ok);

			// Get the newly created user (auth required)
			const { body: getResponse } = await request
				.get(`/api/users/${createResponse.id}`)
				.set("x-auth", tokenResponse.token)
				.expect(StatusCode.ok);
			expect(getResponse.name).equal("test");

			// Successfully update user (auth required)
			const { body: updateResponse } = await request
				.patch(`/api/users/${createResponse.id}`)
				.set("x-auth", tokenResponse.token)
				.send({
					email: "test-user+updated@panenco.com",
				} as User)
				.expect(StatusCode.ok);

			expect(updateResponse.name).equal("test");
			expect(updateResponse.email).equal("test-user+updated@panenco.com");

			// Get all users (auth required)
			const { body: getAllResponse } = await request
				.get(`/api/users`)
				.set("x-auth", tokenResponse.token)
				.expect(StatusCode.ok);

			expect(getAllResponse.length).equal(2); // Auth user + test user
			const newUser = getAllResponse.find(
				(x: User) => x.name === getResponse.name
			);
			expect(newUser).not.undefined;
			expect(newUser.email).equal("test-user+updated@panenco.com");

			// Delete the newly created user (auth required)
			await request
				.delete(`/api/users/${createResponse.id}`)
				.set("x-auth", tokenResponse.token)
				.expect(204);

			// Get all users again after deleted the user (auth required)
			const { body: getNoneResponse } = await request
				.get(`/api/users`)
				.set("x-auth", tokenResponse.token)
				.expect(StatusCode.ok);
			expect(getNoneResponse.length).equal(1); // Only the auth user should remain
		});
	});
});
