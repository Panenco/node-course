import { NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import bcrypt from "bcryptjs";

import { prisma } from "../../../lib/prisma";
import { UserBody } from "../../../contracts/user.body";
import { UserView } from "../../../contracts/user.view";

export const update = async (
	id: string,
	body: Partial<UserBody>
): Promise<UserView> => {
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

	const user = await prisma.user.update({
		where: { id },
		data: updateData,
	});

	return plainToInstance(UserView, user, { excludeExtraneousValues: true });
};
