import { prisma } from "../../../lib/prisma";
import { NotFound } from "@panenco/papi";

export const deleteUser = async (id: string) => {
	const existingUser = await prisma.user.findUnique({
		where: { id },
	});

	if (!existingUser) {
		throw new NotFound("userNotFound", "User not found");
	}

	await prisma.user.delete({
		where: { id },
	});
};
