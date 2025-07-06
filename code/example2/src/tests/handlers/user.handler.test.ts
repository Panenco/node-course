import { expect } from "chai";
import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, it } from "mocha";
import { create } from "../../controllers/users/handlers/create.handler";
import { deleteUser } from "../../controllers/users/handlers/delete.handler";
import { get } from "../../controllers/users/handlers/get.handler";
import { getList } from "../../controllers/users/handlers/getList.handler";
import { update } from "../../controllers/users/handlers/update.handler";
import { User, UserStore } from "../../controllers/users/handlers/user.store";

const userFixtures: User[] = [
	{
		name: "test1",
		email: "test-user+1@panenco.com",
		id: 0,
		password: "password1",
	},
	{
		name: "test2",
		email: "test-user+2@panenco.com",
		id: 1,
		password: "password2",
	},
];

describe("Users handler tests", () => {
	let res: any;
	beforeEach(() => {
		UserStore.users = [];
		UserStore.add({
			name: "test1",
			email: "test-user+1@panenco.com",
			password: "test",
		});
		UserStore.add({
			name: "test2",
			email: "test-user+2@panenco.com",
			password: "test",
		});
	});

	describe("getList", () => {
		it("should return all users when no search query is given", () => {
			getList(
				{ query: {} } as unknown as Request,
				{ json: (val) => (res = val) } as Response,
				null as any
			);
			expect(res.length).equal(2);
			expect(res.some((x) => x.name === "test2")).true;
		});

		it("should return subset when search query is given", () => {
			getList(
				{ query: { search: "test1" } } as unknown as Request,
				{ json: (val) => (res = val) } as Response,
				null as any
			);
			expect(res.length).equal(1);
			expect(res.some((x) => x.name === "test1")).true;
		});
	});

	describe("get", () => {
		it("should return a user with id 1", () => {
			get(
				{ params: { id: "1" } as any } as Request,
				{ json: (val) => (res = val) } as Response,
				null as any
			);
			expect(res).not.undefined;
			expect(res.name).equal("test2");
			expect(res.email).equal("test-user+2@panenco.com");
		});

		it("should return 404 when user not found", () => {
			get(
				{ params: { id: "9999" } as any } as Request,
				{
					status: (code) => ({
						json: (val) => {
							res = val;
						},
					}),
					json: (val) => (res = val),
				} as any,
				null as any
			);
		});
	});

	describe("create", () => {
		it("should return the newly created user object", async () => {
			const body: User = {
				name: "newUser",
				email: "test-user+new@panenco.com",
				password: "secretstuff",
			} as User;
			await create(
				{ body } as Request,
				{ json: (val) => (res = val) } as Response,
				null as any
			);
			expect(res).not.undefined;
			expect(res.name).equal("newUser");
			expect(res.email).equal("test-user+new@panenco.com");
			expect(res.password).undefined;
		});
	});

	describe("update", () => {
		it("should return the updated object", () => {
			const body = { email: "test-user+updated@panenco.com" };
			const id = UserStore.users[0].id;
			let nextCalled = false;
			const mockRes = {
				locals: { body },
				status: () => mockRes,
				json: () => mockRes,
			} as any;

			update(
				{
					params: { id: id.toString() },
					body,
				} as unknown as Request,
				mockRes,
				() => {
					nextCalled = true;
				}
			);

			const user = UserStore.users.find((x) => x.id === id);
			expect(user).not.undefined;
			expect(user?.email).equal(body.email);
			expect(nextCalled).true;
		});
	});

	describe("delete", () => {
		it("should delete user", () => {
			let status: number = 0;
			deleteUser(
				{ params: { id: "0" } } as unknown as Request,
				{
					status: (s) => {
						status = s;
						return { end: () => null };
					},
				} as any,
				null as any
			);

			expect(UserStore.users.find((x) => x.id === 0)).undefined;
			expect(status).equal(204);
		});
	});
});
