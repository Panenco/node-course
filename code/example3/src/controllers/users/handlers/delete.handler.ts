import { NotFoundException } from "@nestjs/common";

import { prisma } from "../../../lib/prisma";

export const deleteUser = async (id: string) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFoundException("User not found");
	}

	await prisma.user.delete({
		where: { id },
	});
};
