import { NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";

import { prisma } from "../../../lib/prisma";
import { UserBody } from "../../../contracts/user.body";

export const update = async (id: string, body: Partial<UserBody>) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFoundException("User not found");
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
