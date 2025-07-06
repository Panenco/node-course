import { prisma } from "../../../lib/prisma";
import { NotFound } from "@panenco/papi";
import bcrypt from "bcryptjs";
import { UserBody } from "../../../contracts/user.body";

export const update = async (id: string, body: Partial<UserBody>) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFound("userNotFound", "User not found");
	}

	const updateData: any = {};
	if (body.name !== undefined) updateData.name = body.name;
	if (body.email !== undefined) updateData.email = body.email;
	if (body.password !== undefined) {
		updateData.password = await bcrypt.hash(body.password, 10);
	}

	return prisma.user.update({
		where: { id },
		data: updateData,
	});
};
