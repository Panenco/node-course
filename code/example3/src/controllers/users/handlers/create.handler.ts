import { prisma } from "../../../lib/prisma";
import { UserBody } from "../../../contracts/user.body";
import bcrypt from "bcryptjs";

export const create = async (body: UserBody) => {
	const hashedPassword = await bcrypt.hash(body.password, 10);

	const user = await prisma.user.create({
		data: {
			name: body.name,
			email: body.email,
			password: hashedPassword,
		},
	});

	return user;
};
