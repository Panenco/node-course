import { NotFoundException } from "@nestjs/common";

import { prisma } from "../../../lib/prisma";

export const get = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
	});

	if (!user) {
		throw new NotFoundException("User not found");
	}

	return user;
};
