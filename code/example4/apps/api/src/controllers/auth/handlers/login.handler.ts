import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import { LoginBody } from "../../../contracts/login.body";

export const createToken = async (body: LoginBody) => {
	const user = await prisma.user.findUnique({
		where: { email: body.email },
	});

	if (!user) {
		throw new UnauthorizedException("Invalid credentials");
	}

	const isPasswordValid = await bcrypt.compare(body.password, user.password);
	if (!isPasswordValid) {
		throw new UnauthorizedException("Invalid credentials");
	}

	const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
		expiresIn: "1h",
	});

	return {
		token,
		expiresIn: 3600,
	};
};
