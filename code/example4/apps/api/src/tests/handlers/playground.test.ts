import { expect } from "chai";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

describe("Playground", () => {
	it("should test database connection", async () => {
		// Clean up before test
		await prisma.user.deleteMany();

		// Create test user
		const hashedPassword = await bcrypt.hash("password123", 10);
		const user = await prisma.user.create({
			data: {
				name: "Test User",
				email: "test@example.com",
				password: hashedPassword,
			},
		});

		// Find the user
		const foundUser = await prisma.user.findUnique({
			where: { email: "test@example.com" },
		});

		expect(foundUser).not.null;
		if (foundUser) {
			expect(foundUser.name).equal("Test User");
		}

		// Clean up after test
		await prisma.user.deleteMany();
	});
});
