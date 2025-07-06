import { prisma } from "../../../lib/prisma";
import { NotFound } from "@panenco/papi";

export const get = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
	});

	if (!user) {
		throw new NotFound("userNotFound", "User not found");
	}

	return user;
};
