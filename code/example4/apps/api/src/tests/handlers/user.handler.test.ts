import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import bcrypt from "bcryptjs";

import { create } from "../../controllers/users/handlers/create.handler";
import { deleteUser } from "../../controllers/users/handlers/delete.handler";
import { get } from "../../controllers/users/handlers/get.handler";
import { getList } from "../../controllers/users/handlers/getList.handler";
import { update } from "../../controllers/users/handlers/update.handler";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "node:crypto";

const userFixtures = [
	{
		name: "test1",
		email: "test-user+1@panenco.com",
		password: "password1",
	},
	{
		name: "test2",
		email: "test-user+2@panenco.com",
		password: "password2",
	},
];

describe("Handler tests", () => {
	describe("User Tests", () => {
		let users: any[];

		beforeEach(async () => {
			// Clean up database
			await prisma.user.deleteMany();

			// Create test users
			users = await Promise.all(
				userFixtures.map(async (fixture) => {
					const hashedPassword = await bcrypt.hash(
						fixture.password,
						10
					);
					return prisma.user.create({
						data: {
							name: fixture.name,
							email: fixture.email,
							password: hashedPassword,
						},
					});
				})
			);
		});

		it("should get users", async () => {
			const res = await getList(undefined);
			expect(res.some((x) => x.name === "test2")).true;
		});

		it("should search users", async () => {
			const res = await getList("test1");
			expect(res.some((x) => x.name === "test1")).true;
		});

		it("should get user by id", async () => {
			const res = await get(users[1].id);

			expect(res.name).equal("test2");
			expect(res.email).equal("test-user+2@panenco.com");
		});

		it("should fail when getting user by unknown id", async () => {
			try {
				await get(randomUUID());
			} catch (error) {
				expect(error.message).equal("User not found");
				return;
			}
			expect(true, "should have thrown an error").false;
		});

		it("should create user", async () => {
			const body = {
				email: "test-user+new@panenco.com",
				name: "newUser",
				password: "reallysecretstuff",
			};
			const res = await create(body);

			expect(res.name).equal("newUser");
			expect(res.email).equal("test-user+new@panenco.com");
		});

		it("should update user", async () => {
			const body = {
				email: "test-user+updated@panenco.com",
			};
			const id = users[0].id;
			const res = await update(id, body);

			expect(res.email).equal(body.email);
			expect(res.name).equal("test1");
		});

		it("should delete user by id", async () => {
			const initialCount = await prisma.user.count();
			await deleteUser(users[0].id);

			const newCount = await prisma.user.count();
			expect(initialCount - 1).equal(newCount);
		});
	});
});
