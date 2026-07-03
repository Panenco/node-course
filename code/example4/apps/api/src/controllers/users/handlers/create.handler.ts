import { plainToInstance } from "class-transformer";
import bcrypt from "bcryptjs";

import { prisma } from "../../../lib/prisma";
import { UserBody } from "../../../contracts/user.body";
import { UserView } from "../../../contracts/user.view";

export const create = async (body: UserBody): Promise<UserView> => {
	const hashedPassword = await bcrypt.hash(body.password, 10);

	const user = await prisma.user.create({
		data: {
			name: body.name,
			email: body.email,
			password: hashedPassword,
		},
	});

	return plainToInstance(UserView, user, { excludeExtraneousValues: true });
};
