import { prisma } from "../../../lib/prisma";
import { createAccessToken, Unauthorized } from "@panenco/papi";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { LoginBody } from "../../../contracts/login.body";

export const createToken = async (body: LoginBody) => {
	const user = await prisma.user.findUnique({
		where: { email: body.email },
	});

	if (!user) {
		throw new Unauthorized("invalidCredentials", "Invalid credentials");
	}

	const isPasswordValid = await bcrypt.compare(body.password, user.password);
	if (!isPasswordValid) {
		throw new Unauthorized("invalidCredentials", "Invalid credentials");
	}

	return createAccessToken(config.jwtSecret, 3600, { userId: user.id });
};
