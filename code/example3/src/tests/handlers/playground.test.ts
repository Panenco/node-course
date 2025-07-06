import { MikroORM } from "@mikro-orm/core";
import { expect } from "chai";
import { User } from "../../entities/user.entity";
import ormConfig from "../../orm.config";

describe("Playground", () => {
	it("should test database connection", async () => {
		const orm = await MikroORM.init(ormConfig);
		const generator = orm.getSchemaGenerator();
		await generator.dropSchema();
		await generator.createSchema();

		const em = orm.em.fork();
		const user = em.create(User, {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		});
		await em.persistAndFlush(user);

		const foundUser = await em.findOne(User, {
			email: "test@example.com",
		});
		expect(foundUser).not.null;
		if (foundUser) {
			expect(foundUser.name).equal("Test User");
		}

		await orm.close();
	});
});
